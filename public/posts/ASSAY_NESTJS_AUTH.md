# Эссе: Полное руководство по авторизации в NestJS с Passport, JWT и Cookies

Привет! Это твой персональный гайд в мир безопасной и современной авторизации в NestJS. Прочитав это эссе, ты не просто научишься копировать код, а станешь специалистом, который **понимает, что происходит на каждой строчке**. Мы построим надежную систему, используя мощную связку: **Passport** для стратегий, **JWT** для токенов и **HttpOnly Cookies** для безопасного хранения.

Поехали! 🚀

---

## 🎯 **Часть 1: Философия и Архитектура**

Прежде чем писать код, давай разберемся в "почему" и "как".

### **Почему именно этот стек?**

1.  **NestJS**: Наш фундамент. Это прогрессивный фреймворк для Node.js, который предоставляет модульную и хорошо структурированную архитектуру. Идеально для сложных систем.
2.  **Passport.js**: Швейцарский нож для аутентификации в Node.js. Его главная фишка — **стратегии**. Вместо того чтобы писать логику извлечения и проверки данных для каждого запроса, мы один раз настраиваем "стратегию" (например, как достать JWT из cookie), а Passport делает всю грязную работу.
3.  **JWT (JSON Web Token)**: Это наш "пропуск" или "паспорт". Когда пользователь успешно логинится, мы выдаем ему JWT. Это компактная, зашифрованная строка, которая содержит информацию о пользователе (например, его ID и роль). При каждом последующем запросе пользователь предъявляет этот токен, и мы, проверив его подлинность, понимаем, кто перед нами. Это позволяет нам создать **stateless** (без сохранения состояния) аутентификацию, что идеально для масштабирования.
4.  **Cookies (с флагом `HttpOnly`)**: Это наш "карман" для хранения JWT на стороне клиента. Почему не `localStorage`? Потому что `localStorage` уязвим для XSS-атак (Cross-Site Scripting). Злоумышленник может внедрить скрипт на вашу страницу и украсть токен. `HttpOnly` cookie недоступен для JavaScript на клиенте, его может читать только сервер. Это **золотой стандарт безопасности** для веб-приложений.

### **Как выглядит полный цикл авторизации?**

Вот как все будет работать, когда мы закончим:

```mermaid
sequenceDiagram
    participant Client as Клиент (Браузер)
    participant Server as Сервер (NestJS)
    participant DB as База данных

    Client->>+Server: POST /auth/login (логин, пароль)
    Server->>+DB: Найти пользователя по логину
    DB-->>-Server: Пользователь найден
    Server->>Server: Проверить хэш пароля
    alt Пароль верный
        Server->>Server: Создать JWT (с ID пользователя)
        Server-->>-Client: Ответ 200 OK + Set-Cookie (httpOnly, JWT)
    else Пароль неверный
        Server-->>-Client: Ответ 401 Unauthorized
    end

    Note over Client, Server: Теперь при каждом запросе браузер будет<br/>автоматически отправлять cookie с JWT

    Client->>+Server: GET /profile (с cookie)
    Server->>Server: Passport.js (JwtStrategy) извлекает JWT из cookie
    Server->>Server: Проверяет подпись JWT (используя секретный ключ)
    alt Подпись валидна
        Server->>Server: Извлекает payload (ID пользователя) из JWT
        Server->>+DB: Найти пользователя по ID
        DB-->>-Server: Пользователь найден
        Server->>Server: Прикрепляет пользователя к объекту запроса (req.user)
        Server-->>-Client: Ответ 200 OK (данные профиля)
    else Подпись невалидна
        Server-->>-Client: Ответ 401 Unauthorized
    end
```

---

## 🛠️ **Часть 2: Пошаговая реализация**

Теперь, когда мы понимаем теорию, перейдем к практике.

### **Шаг 1: Установка зависимостей**

Открой терминал в корне проекта и выполни команду:

```bash
pnpm add @nestjs/passport passport passport-jwt @nestjs/jwt jsonwebtoken cookie-parser
pnpm add -D @types/passport-jwt @types/cookie-parser
```

*   `@nestjs/passport`, `passport`: Основные модули Passport.
*   `passport-jwt`, `@types/passport-jwt`: Стратегия для работы с JWT.
*   `@nestjs/jwt`, `jsonwebtoken`: Библиотеки для создания и проверки JWT.
*   `cookie-parser`, `@types/cookie-parser`: Middleware для парсинга cookie из запросов.

### **Шаг 2: Настройка окружения (`.env`)**

Безопасность начинается с секретов. Добавь секретный ключ для JWT в файл `.env`.

```env
# .env
JWT_SECRET=YOUR_SUPER_SECRET_KEY_THAT_IS_VERY_LONG_AND_COMPLEX
JWT_EXPIRATION_TIME=3600s
```
> **Важно**: `JWT_SECRET` должен быть длинной, сложной и случайной строкой. Никогда не храни его в коде!

### **Ша- 3: Главный файл (`main.ts`)**

Нам нужно научить наше приложение работать с `cookie-parser`.

```typescript
// src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser'; // Импортируем cookie-parser

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 👇 Вот эта строчка
  // Регистрируем middleware для парсинга cookie.
  // Теперь в любом контроллере мы сможем получить доступ к `req.cookies`.
  app.use(cookieParser());

  await app.listen(3000);
}
bootstrap();
```

### **Шаг 4: Модуль авторизации (`auth.module.ts`)**

Создадим модуль, который будет содержать всю логику авторизации.

```bash
nest g module auth
nest g service auth
nest g controller auth
```

Теперь настроим `auth.module.ts`.

```typescript
// src/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
// Предполагается, что у вас есть модуль пользователей
import { UsersModule } from '../users/users.module';

@Module({
  // `imports` - здесь мы подключаем другие модули, которые нам понадобятся.
  imports: [
    // Подключаем модуль пользователей, чтобы сервис авторизации мог их находить.
    UsersModule,

    // Настраиваем Passport.js. `defaultStrategy: 'jwt'` означает, что если мы
    // где-то используем гвард `@UseGuards(AuthGuard())` без указания стратегии,
    // по умолчанию будет использоваться JWT-стратегия.
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // Настраиваем модуль для работы с JWT.
    JwtModule.registerAsync({
      // `registerAsync` позволяет нам асинхронно сконфигурировать модуль,
      // например, чтобы взять параметры из `.env` файла.
      imports: [ConfigModule], // Импортируем ConfigModule, чтобы получить доступ к ConfigService.
      inject: [ConfigService], // Внедряем ConfigService в нашу фабрику.
      useFactory: async (configService: ConfigService) => ({
        // `secret` - это наш секретный ключ для подписи токенов.
        // Мы берем его из переменных окружения для безопасности.
        secret: configService.get<string>('JWT_SECRET'),
        // `signOptions` - опции для создания токена.
        signOptions: {
          // `expiresIn` - время жизни токена. После этого времени токен станет невалидным.
          expiresIn: configService.get<string>('JWT_EXPIRATION_TIME'),
        },
      }),
    }),
  ],
  // `providers` - это сервисы и стратегии, которые будут доступны внутри этого модуля.
  providers: [AuthService, JwtStrategy],
  // `controllers` - контроллеры, которые обрабатывают HTTP-запросы.
  controllers: [AuthController],
})
export class AuthModule {}
```

### **Шаг 5: JWT Стратегия (`jwt.strategy.ts`)**

Это сердце нашей аутентификации. Стратегия отвечает на один вопрос: "Как проверить, что входящий запрос аутентифицирован?".

Создай файл `src/auth/jwt.strategy.ts`.

```typescript
// src/auth/jwt.strategy.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { UsersService } from '../users/users.service'; // Предполагаем, что есть сервис пользователей

// `@Injectable()` - делает класс доступным для Dependency Injection в NestJS.
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  // `constructor` - здесь мы внедряем зависимости, которые понадобятся стратегии.
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    // `super()` - вызываем конструктор родительского класса `PassportStrategy`.
    super({
      // `jwtFromRequest` - это функция, которая определяет, как извлечь JWT из запроса.
      // Мы напишем свою логику, чтобы извлекать токен из cookie.
      jwtFromRequest: ExtractJwt.fromExtractors([
        // Наша кастомная функция-экстрактор.
        (request: Request) => {
          // Мы ожидаем, что токен будет в cookie с именем `access_token`.
          const token = request.cookies?.access_token;
          // Если токена нет, возвращаем null, и Passport поймет, что запрос не аутентифицирован.
          if (!token) {
            return null;
          }
          // Возвращаем токен для дальнейшей проверки.
          return token;
        },
      ]),
      // `ignoreExpiration: false` - Passport будет автоматически проверять, не истек ли срок действия токена.
      // Если токен истек, запрос будет отклонен с ошибкой 401.
      ignoreExpiration: false,
      // `secretOrKey` - секретный ключ, который используется для проверки подписи токена.
      // Он должен быть таким же, как и при создании токена.
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  // `validate` - это главный метод стратегии. Он вызывается Passport'ом только ПОСЛЕ того,
  // как токен был успешно извлечен и его подпись и срок действия были проверены.
  // `payload` - это расшифрованное содержимое JWT.
  async validate(payload: { sub: number; email: string }) {
    // `sub` (subject) - это стандартное поле в JWT, мы будем использовать его для хранения ID пользователя.
    const user = await this.usersService.findOne(payload.sub);

    // Если пользователь с таким ID не найден в базе данных...
    if (!user) {
      // ...выбрасываем ошибку. Запрос будет отклонен.
      throw new UnauthorizedException('User not found');
    }

    // Если все хорошо, мы возвращаем объект пользователя.
    // NestJS автоматически прикрепит этот объект к запросу как `req.user`.
    // Теперь в любом защищенном маршруте мы сможем получить доступ к текущему пользователю.
    // Важно: не возвращайте пароль или другие чувствительные данные!
    const { password, ...result } = user;
    return result;
  }
}
```

### **Шаг 6: Сервис авторизации (`auth.service.ts`)**

Здесь будет бизнес-логика: проверка пользователя и создание токена.

```typescript
// src/auth/auth.service.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt'; // Для сравнения паролей

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // `validateUser` - проверяет, существует ли пользователь и верен ли пароль.
  async validateUser(email: string, pass: string): Promise<any> {
    // Находим пользователя по email.
    const user = await this.usersService.findByEmail(email);

    // Если пользователь найден и пароль совпадает...
    // `bcrypt.compare` сравнивает обычный пароль с захэшированным в базе.
    if (user && (await bcrypt.compare(pass, user.password))) {
      // ...возвращаем пользователя без пароля.
      const { password, ...result } = user;
      return result;
    }
    // Если что-то не так, возвращаем null.
    return null;
  }

  // `login` - создает и возвращает JWT для пользователя.
  async login(user: any) {
    // `payload` - это данные, которые мы хотим закодировать в токен.
    const payload = { email: user.email, sub: user.id }; // `sub` - это стандартное имя для ID.

    // `this.jwtService.sign` создает и подписывает токен.
    // Он использует секретный ключ и опции (например, `expiresIn`), которые мы настроили в `auth.module.ts`.
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
```

### **Шаг 7: Контроллер авторизации (`auth.controller.ts`)**

Это наши "ворота" в мир авторизации. Здесь будут эндпоинты для входа, выхода и получения профиля.

```typescript
// src/auth/auth.controller.ts

import { Controller, Post, Body, UseGuards, Get, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // `POST /auth/login` - эндпоинт для входа в систему.
  @Post('login')
  async login(@Body() loginDto: any, @Res({ passthrough: true }) response: Response) {
    // `validateUser` проверяет логин и пароль.
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    // Если пользователь не найден или пароль неверный, выбрасываем ошибку.
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    // `login` создает JWT.
    const { access_token } = await this.authService.login(user);

    // `response.cookie` - устанавливаем cookie.
    response.cookie('access_token', access_token, {
      // `httpOnly: true` - cookie недоступен для JavaScript на клиенте. Защита от XSS.
      httpOnly: true,
      // `secure: true` - cookie будет отправляться только по HTTPS. В режиме разработки можно установить в `false`.
      secure: process.env.NODE_ENV === 'production',
      // `sameSite: 'strict'` - защита от CSRF-атак. Cookie будет отправляться только если запрос идет с того же сайта.
      sameSite: 'strict',
      // `expires` - можно установить время жизни cookie.
      // expires: new Date(Date.now() + 3600 * 1000), // Например, 1 час
    });

    // Возвращаем успешный ответ.
    return { message: 'Logged in successfully' };
  }

  // `GET /auth/profile` - защищенный маршрут для получения данных о текущем пользователе.
  // `@UseGuards(AuthGuard('jwt'))` - это "стражник". Он запускает нашу JWT-стратегию.
  // Если стратегия успешно отработает (токен валиден), то метод будет выполнен.
  // Если нет - вернется ошибка 401 Unauthorized.
  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Req() req: Request) {
    // Благодаря `validate` в нашей стратегии, объект `req.user` теперь содержит
    // данные о пользователе, которые мы вернули.
    return req.user;
  }

  // `POST /auth/logout` - эндпоинт для выхода из системы.
  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    // `response.clearCookie` - удаляем cookie, тем самым "разлогинивая" пользователя.
    response.clearCookie('access_token');
    return { message: 'Logged out successfully' };
  }
}
```

### **Шаг 8: Защита других маршрутов**

Теперь защитить любой маршрут в приложении очень просто. Просто добавь гвард!

```typescript
// Например, в `src/todos/todos.controller.ts`

import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('todos')
export class TodosController {
  // 👇 Вот и вся магия!
  // Этот гвард не даст неавторизованным пользователям получить доступ к эндпоинту.
  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll() {
    return [{ id: 1, title: 'Сделать крутую авторизацию' }];
  }
}
```

---

## 🔐 **Часть 3: Безопасность и лучшие практики**

Мы уже внедрили много хороших практик, но давай их закрепим.

1.  **`httpOnly` Cookies**: Мы это сделали. Это критически важно для защиты от XSS.
2.  **`secure` и `sameSite`**: Мы это сделали. `secure: true` в продакшене и `sameSite: 'strict'` (или `'lax'`) — мощная защита от CSRF.
3.  **Короткое время жизни токена**: Наш `access_token` живет недолго (например, 1 час). Это уменьшает окно уязвимости, если токен все же будет скомпрометирован.
4.  **Refresh Tokens (продвинутая тема)**: Для улучшения UX можно внедрить Refresh-токены. Это долгоживущие токены, которые хранятся в базе данных и используются для получения нового `access_token`, когда старый истекает. Это позволяет пользователю оставаться в системе неделями, не вводя пароль заново, при этом сохраняя безопасность короткоживущих токенов доступа.
5.  **Никогда не храните пароли в открытом виде**: Используйте `bcrypt` для хэширования паролей перед сохранением в базу. Мы это учли в `auth.service`.

---

## ✨ **Заключение**

Поздравляю! Ты только что прошел путь от новичка до специалиста в области аутентификации в NestJS. Ты не просто реализовал систему, а понял, **почему** каждый элемент находится на своем месте.

-   Ты знаешь, как **Passport** упрощает аутентификацию с помощью **стратегий**.
-   Ты понимаешь, почему **JWT** — отличный выбор для **stateless** API.
-   Ты осознаешь, что **`httpOnly` cookies** — это **must-have** для безопасности.

Теперь ты можешь уверенно строить безопасные, масштабируемые и профессиональные веб-приложения. Эта база знаний — твой надежный фундамент для дальнейшего роста. Удачи в твоих проектах!
