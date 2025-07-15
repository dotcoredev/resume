# Хуки в React: Руководство для понимания "Когда и Почему"

## Введение

Хуки в React — это не магия, это инструменты для решения конкретных проблем. Главная проблема разработчиков: они используют хуки "на всякий случай" вместо понимания их назначения. Давайте разберем каждый хук с практическими примерами и четкими принципами использования.

## 1. useState — Управление состоянием

**Принцип**: Используйте для данных, которые изменяются и влияют на отображение.

```tsx
// ✅ Правильно - состояние влияет на UI
const [count, setCount] = useState(0);

// ❌ Неправильно - константа не должна быть в состоянии
const [apiUrl] = useState("https://api.example.com"); // Лучше: const apiUrl = 'https://api.example.com'

// ✅ Правильно - пользовательский ввод
const [username, setUsername] = useState("");
```

**Когда НЕ использовать**: Для констант, вычисляемых значений, refs.

## 2. useEffect — Побочные эффекты

**Принцип**: Используйте для синхронизации компонента с внешними системами.

```tsx
// ✅ Правильно - подписка на внешние события
useEffect(() => {
	const handleResize = () => setWindowWidth(window.innerWidth);
	window.addEventListener("resize", handleResize);
	return () => window.removeEventListener("resize", handleResize);
}, []);

// ❌ Неправильно - обработка пользовательских событий
useEffect(() => {
	// Это должно быть в onClick handler
	if (buttonClicked) {
		handleButtonClick();
	}
}, [buttonClicked]);

// ✅ Правильно - сетевые запросы
useEffect(() => {
	fetchUserData(userId).then(setUser);
}, [userId]);
```

**Когда НЕ использовать**: Для обработки пользовательских событий, вычислений, которые можно сделать при рендере.

## 3. useCallback — Мемоизация функций

**Принцип**: Используйте ТОЛЬКО когда функция передается как пропс в дочерний компонент или в зависимости других хуков.

```tsx
// ❌ Бесполезно - функция не передается никуда
const handleClick = useCallback(() => {
	console.log("clicked");
}, []);

// ✅ Правильно - передается в дочерний компонент
const ExpensiveChild = React.memo(({ onClick }) => {
	// Тяжелый компонент
	return <button onClick={onClick}>Click me</button>;
});

const Parent = () => {
	const [count, setCount] = useState(0);

	// Без useCallback ExpensiveChild будет перерендериваться
	const handleClick = useCallback(() => {
		console.log("clicked");
	}, []);

	return <ExpensiveChild onClick={handleClick} />;
};

// ✅ Правильно - в зависимостях useEffect
useEffect(() => {
	fetchData();
}, [fetchData]); // fetchData должен быть в useCallback
```

**Когда НЕ использовать**: Для обычных event handlers, которые не передаются в дочерние компоненты.

## 4. useMemo — Мемоизация вычислений

**Принцип**: Используйте для дорогих вычислений или создания стабильных ссылок на объекты.

```tsx
// ✅ Правильно - дорогое вычисление
const expensiveValue = useMemo(() => {
	return heavyCalculation(data);
}, [data]);

// ❌ Неправильно - простое вычисление
const simpleValue = useMemo(() => {
	return a + b; // Это быстрее без useMemo
}, [a, b]);

// ✅ Правильно - стабильная ссылка на объект
const config = useMemo(
	() => ({
		apiUrl: "https://api.example.com",
		timeout: 5000,
	}),
	[]
); // Объект не пересоздается при каждом рендере
```

**Когда НЕ использовать**: Для простых вычислений, примитивных значений.

## 5. useRef — Ссылки на DOM и мутабельные значения

**Принцип**: Используйте для доступа к DOM элементам или хранения мутабельных значений, которые не влияют на рендер.

```tsx
// ✅ Правильно - DOM элемент
const inputRef = useRef<HTMLInputElement>(null);
const focusInput = () => inputRef.current?.focus();

// ✅ Правильно - мутабельное значение (не влияет на рендер)
const timerRef = useRef<NodeJS.Timeout | null>(null);

// ❌ Неправильно - значение влияет на рендер
const countRef = useRef(0); // Лучше: useState(0)
```

**Когда НЕ использовать**: Для состояния, которое влияет на UI.

## 6. useContext — Передача данных через дерево компонентов

**Принцип**: Используйте для глобального состояния или избежания prop drilling.

```tsx
// ✅ Правильно - глобальная тема
const ThemeContext = createContext<"light" | "dark">("light");

// ✅ Правильно - данные пользователя
const UserContext = createContext<User | null>(null);

// ❌ Неправильно - локальное состояние
const CountContext = createContext<number>(0); // Лучше передать через пропсы
```

## 7. useReducer — Сложная логика состояния

**Принцип**: Используйте когда логика состояния сложная или состояние имеет несколько связанных значений.

```tsx
// ✅ Правильно - сложная логика
const [state, dispatch] = useReducer(formReducer, {
	name: "",
	email: "",
	errors: {},
	isSubmitting: false,
});

// ❌ Неправильно - простое состояние
const [count, dispatch] = useReducer(
	(state, action) => (action.type === "increment" ? state + 1 : state - 1),
	0
); // Лучше: useState(0)
```

## Практические Принципы

### 1. Правило зависимостей

```tsx
// ✅ Все используемые переменные в зависимостях
useEffect(() => {
	fetchData(userId, filter);
}, [userId, filter]);

// ❌ Пропущенные зависимости
useEffect(() => {
	fetchData(userId, filter);
}, [userId]); // filter пропущен!
```

### 2. Не оптимизируйте преждевременно

```tsx
// ❌ Ненужная оптимизация
const MyComponent = () => {
	const handleClick = useCallback(() => {
		console.log("click");
	}, []); // Бесполезно если не передается в дочерние компоненты

	return <button onClick={handleClick}>Click</button>;
};

// ✅ Простое решение
const MyComponent = () => {
	const handleClick = () => {
		console.log("click");
	};

	return <button onClick={handleClick}>Click</button>;
};
```

### 3. Стабильность ссылок

```tsx
// ❌ Нестабильная ссылка
const MyComponent = () => {
	const config = { apiUrl: "https://api.com" }; // Новый объект каждый рендер

	useEffect(() => {
		fetchWithConfig(config);
	}, [config]); // Будет вызываться каждый рендер
};

// ✅ Стабильная ссылка
const MyComponent = () => {
	const config = useMemo(
		() => ({
			apiUrl: "https://api.com",
		}),
		[]
	); // Объект создается один раз

	useEffect(() => {
		fetchWithConfig(config);
	}, [config]);
};
```

## Заключение

**Главное правило**: Используйте хуки для решения конкретных проблем, а не "на всякий случай".

-   **useState** — для UI состояния
-   **useEffect** — для синхронизации с внешними системами
-   **useCallback** — только когда функция передается в дочерние компоненты
-   **useMemo** — для дорогих вычислений и стабильных ссылок
-   **useRef** — для DOM и мутабельных значений
-   **useContext** — для глобального состояния
-   **useReducer** — для сложной логики состояния

Помните: простой код лучше оптимизированного, но сложного кода. Начинайте с простого решения и оптимизируйте только при необходимости!
