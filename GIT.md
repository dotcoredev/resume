# Git: Работа с ветками и исправление ошибок

## 📋 Содержание

1. [Ваша ситуация: коммиты в неправильной ветке](#ваша-ситуация-коммиты-в-неправильной-ветке)
2. [Основы работы с ветками](#основы-работы-с-ветками)
3. [Способы исправления ошибки](#способы-исправления-ошибки)
4. [Профилактика проблем](#профилактика-проблем)
5. [Полезные команды](#полезные-команды)

---

## Ваша ситуация: коммиты в неправильной ветке

### 🚨 Проблема

Вы работали над чатом, но забыли переключиться на ветку `chat` и закоммитили все изменения в ветку `dev`.

### 💡 Решения (от простого к сложному)

#### **Способ 1: Если еще НЕ запушили в dev**

```bash
# 1. Создайте новую ветку chat из текущего состояния dev
git branch chat

# 2. Переключитесь на новую ветку
git checkout chat

# 3. Вернитесь в dev
git checkout dev

# 4. Откатите dev к состоянию ДО ваших коммитов
git reset --hard HEAD~3  # где 3 - количество ваших коммитов

# 5. Переключитесь обратно на chat
git checkout chat
```

#### **Способ 2: Если УЖЕ запушили в dev**

```bash
# 1. Создайте ветку chat из dev
git checkout dev
git checkout -b chat

# 2. Запушьте ветку chat
git push origin chat

# 3. Вернитесь в dev
git checkout dev

# 4. Создайте revert коммит для отмены изменений в dev
git revert HEAD~2..HEAD  # Отменяет последние 2 коммита

# 5. Запушьте исправленную dev
git push origin dev
```

#### **Способ 3: Cherry-pick (если коммиты вперемешку)**

```bash
# 1. Посмотрите историю коммитов
git log --oneline

# 2. Создайте и переключитесь на ветку chat
git checkout -b chat origin/main  # или другую базовую ветку

# 3. Перенесите нужные коммиты
git cherry-pick abc123f  # хеш коммита для чата
git cherry-pick def456g  # еще один коммит для чата

# 4. Запушьте ветку chat
git push origin chat

# 5. Удалите ненужные коммиты из dev (если возможно)
git checkout dev
git reset --hard HEAD~3  # или revert для публичной ветки
```

---

## Основы работы с ветками

### 🌳 Создание и переключение веток

```bash
# Создать новую ветку
git branch feature-name

# Создать и сразу переключиться
git checkout -b feature-name

# Современный способ (Git 2.23+)
git switch -c feature-name

# Переключиться на существующую ветку
git checkout feature-name
git switch feature-name
```

### 📊 Информация о ветках

```bash
# Посмотреть все ветки
git branch -a

# Посмотреть текущую ветку
git branch --show-current

# Посмотреть последние коммиты по веткам
git branch -v

# Посмотреть связь с удаленными ветками
git branch -vv
```

### 🔄 Работа с удаленными ветками

```bash
# Получить изменения из удаленного репозитория
git fetch origin

# Создать локальную ветку из удаленной
git checkout -b local-branch origin/remote-branch

# Отправить локальную ветку в удаленный репозиторий
git push origin feature-name

# Установить связь локальной ветки с удаленной
git push --set-upstream origin feature-name
```

---

## Способы исправления ошибки

### 🔧 Reset vs Revert vs Cherry-pick

#### **Reset** (изменяет историю)

```bash
# Мягкий reset (файлы остаются измененными)
git reset --soft HEAD~1

# Жесткий reset (все изменения удаляются)
git reset --hard HEAD~1

# ⚠️ Используйте только для НЕ запушенных коммитов!
```

#### **Revert** (создает новый коммит отмены)

```bash
# Отменить последний коммит
git revert HEAD

# Отменить конкретный коммит
git revert abc123f

# Отменить диапазон коммитов
git revert HEAD~3..HEAD

# ✅ Безопасно для публичных веток
```

#### **Cherry-pick** (копирует коммиты)

```bash
# Скопировать один коммит
git cherry-pick abc123f

# Скопировать диапазон коммитов
git cherry-pick abc123f..def456g

# Скопировать без создания коммита (для правки)
git cherry-pick --no-commit abc123f
```

---

## Профилактика проблем

### 🛡️ Настройка Git для безопасности

#### **1. Настройте отображение текущей ветки в терминале**

```bash
# Добавьте в ~/.bashrc или ~/.zshrc
parse_git_branch() {
    git branch 2> /dev/null | sed -e '/^[^*]/d' -e 's/* \(.*\)/ (\1)/'
}
export PS1="\u@\h \[\033[32m\]\w\[\033[33m\]\$(parse_git_branch)\[\033[00m\] $ "
```

#### **2. Используйте Git hooks**

```bash
# Создайте pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
current_branch=$(git rev-parse --abbrev-ref HEAD)
if [ "$current_branch" = "main" ] || [ "$current_branch" = "master" ]; then
    echo "❌ Прямые коммиты в $current_branch запрещены!"
    exit 1
fi
EOF

chmod +x .git/hooks/pre-commit
```

#### **3. Настройте псевдонимы**

```bash
git config --global alias.current-branch 'rev-parse --abbrev-ref HEAD'
git config --global alias.whoami 'config user.email'
git config --global alias.visual '!gitk'
```

### 📋 Чеклист перед коммитом

-   [ ] Проверить текущую ветку: `git branch --show-current`
-   [ ] Убедиться, что работаете в правильной ветке
-   [ ] Проверить статус: `git status`
-   [ ] Просмотреть изменения: `git diff`
-   [ ] Добавить файлы: `git add .`
-   [ ] Сделать коммит: `git commit -m "feat: описание изменений"`

---

## Полезные команды

### 🔍 Исследование истории

```bash
# Красивая история коммитов
git log --oneline --graph --decorate --all

# Поиск коммитов по автору
git log --author="Ваше Имя"

# Поиск коммитов по сообщению
git log --grep="bug fix"

# Посмотреть изменения в коммите
git show abc123f

# Найти когда была изменена строка
git blame filename.txt
```

### 🔄 Управление изменениями

```bash
# Спрятать изменения
git stash

# Достать спрятанные изменения
git stash pop

# Посмотреть что спрятано
git stash list

# Применить изменения без удаления из stash
git stash apply

# Интерактивное добавление изменений
git add -p

# Исправить последний коммит
git commit --amend
```

### 🌐 Работа с удаленными репозиториями

```bash
# Посмотреть удаленные репозитории
git remote -v

# Добавить удаленный репозиторий
git remote add origin https://github.com/user/repo.git

# Получить изменения без слияния
git fetch origin

# Получить изменения со слиянием
git pull origin main

# Отправить изменения
git push origin feature-branch
```

---

## 🚀 Решение вашей конкретной ситуации

### Пошаговый план действий:

1. **Проверьте текущее состояние**

    ```bash
    git status
    git log --oneline -5
    git branch --show-current
    ```

2. **Создайте ветку chat из dev**

    ```bash
    git checkout -b chat
    git push origin chat
    ```

3. **Если dev еще не запушена**

    ```bash
    git checkout dev
    git reset --hard HEAD~X  # где X - количество ваших коммитов
    ```

4. **Если dev уже запушена**

    ```bash
    git checkout dev
    git revert HEAD~X..HEAD  # отменяет последние X коммитов
    git push origin dev
    ```

5. **Переключитесь на chat и продолжайте работу**
    ```bash
    git checkout chat
    ```

### 🎯 Итоговый результат:

-   ✅ Ветка `chat` содержит ваши изменения
-   ✅ Ветка `dev` очищена от изменений чата
-   ✅ История сохранена и читаема
-   ✅ Удаленные ветки синхронизированы

---

## 💡 Полезные советы

1. **Всегда проверяйте ветку перед началом работы**
2. **Используйте `git status` часто**
3. **Делайте небольшие коммиты с понятными сообщениями**
4. **Регулярно синхронизируйтесь с удаленным репозиторием**
5. **Изучите Git Flow или GitHub Flow для команды**

**Помните:** Ошибки в Git почти всегда можно исправить, главное не паниковать! 🚀
