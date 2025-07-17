Авторизация в WebSocket-соединениях — это очень важная и интересная тема, которая отличается от обычной REST API авторизации. Я создам подробное эссе и объясню все нюансы.

````markdown
# Эссе: Авторизация в WebSocket сервере на NestJS

## Введение: Почему WebSocket авторизация особенная?

WebSocket-соединения кардинально отличаются от обычных HTTP-запросов. Если с REST API мы можем проверять токен на каждом запросе, то WebSocket создает **постоянное соединение**, которое живет долго. Это создает уникальные вызовы для безопасности.

### Основные отличия:

-   **Долгоживущие соединения**: Соединение устанавливается один раз и может жить часами
-   **Bidirectional communication**: Сервер может отправлять данные клиенту в любой момент
-   **Отсутствие заголовков**: После handshake нет HTTP-заголовков для каждого сообщения
-   **Состояние соединения**: Нужно отслеживать, кто подключен и авторизован

## Глава 1: Структура WebSocket модуля в NestJS

### 1.1 Базовая настройка WebSocket Gateway

```typescript
// src/websocket/websocket.gateway.ts
import {
	WebSocketGateway,
	WebSocketServer,
	OnGatewayInit,
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	MessageBody,
	ConnectedSocket,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Logger } from "@nestjs/common";

@WebSocketGateway({
	cors: {
		origin: ["http://localhost:3000"], // Адреса, которым разрешено подключение
		methods: ["GET", "POST"],
		credentials: true, // Важно для cookies
	},
})
export class WebSocketGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	@WebSocketServer()
	server: Server;

	private logger: Logger = new Logger("WebSocketGateway");

	// Вызывается при инициализации сервера
	afterInit(server: Server) {
		this.logger.log("WebSocket Server initialized");
	}

	// Вызывается при каждом новом подключении
	handleConnection(client: Socket, ...args: any[]) {
		this.logger.log(`Client connected: ${client.id}`);
	}

	// Вызывается при отключении клиента
	handleDisconnect(client: Socket) {
		this.logger.log(`Client disconnected: ${client.id}`);
	}

	// Пример обработки сообщения
	@SubscribeMessage("message")
	handleMessage(
		@MessageBody() data: any,
		@ConnectedSocket() client: Socket
	): void {
		this.logger.log(`Received message from ${client.id}: ${data}`);
		// Отправляем сообщение всем подключенным клиентам
		this.server.emit("message", data);
	}
}
```

### 1.2 Регистрация в модуле

```typescript
// src/websocket/websocket.module.ts
import { Module } from "@nestjs/common";
import { WebSocketGateway } from "./websocket.gateway";
import { AuthModule } from "../auth/auth.module"; // Подключаем модуль авторизации

@Module({
	imports: [AuthModule], // Импортируем, чтобы использовать JwtService
	providers: [WebSocketGateway],
})
export class WebSocketModule {}
```

## Глава 2: Способы авторизации в WebSocket

### 2.1 Способ 1: Авторизация через query параметры

Это самый простой способ - передать токен в строке запроса при подключении.

```typescript
// src/websocket/websocket.gateway.ts
import { JwtService } from "@nestjs/jwt";
import { UnauthorizedException } from "@nestjs/common";

@WebSocketGateway({
	cors: {
		origin: ["http://localhost:3000"],
		credentials: true,
	},
})
export class WebSocketGateway
	implements OnGatewayConnection, OnGatewayDisconnect
{
	constructor(private jwtService: JwtService) {}

	async handleConnection(client: Socket, ...args: any[]) {
		try {
			// Извлекаем токен из query параметров
			const token = client.handshake.query.token as string;

			if (!token) {
				throw new UnauthorizedException("No token provided");
			}

			// Верифицируем токен
			const payload = await this.jwtService.verifyAsync(token);

			// Сохраняем информацию о пользователе в сокете
			client.data.user = payload; // payload содержит userId, email и т.д.

			this.logger.log(
				`User ${payload.email} connected with socket ${client.id}`
			);
		} catch (error) {
			this.logger.error(`Connection rejected: ${error.message}`);
			client.disconnect(); // Отключаем клиента, если токен невалидный
		}
	}

	@SubscribeMessage("message")
	handleMessage(
		@MessageBody() data: any,
		@ConnectedSocket() client: Socket
	): void {
		// Теперь мы можем получить доступ к данным пользователя
		const user = client.data.user;

		if (!user) {
			client.emit("error", "Unauthorized");
			return;
		}

		this.logger.log(`Message from ${user.email}: ${data}`);
		// Отправляем сообщение всем, включая информацию об отправителе
		this.server.emit("message", {
			user: { id: user.userId, email: user.email },
			message: data,
			timestamp: new Date().toISOString(),
		});
	}
}
```

**Клиентская часть:**

```javascript
// Frontend (React/JavaScript)
import { io } from "socket.io-client";

const token = localStorage.getItem("accessToken");
const socket = io("http://localhost:3001", {
	query: { token }, // Передаем токен в query параметрах
});

socket.on("connect", () => {
	console.log("Connected to server");
});

socket.on("error", (error) => {
	console.error("Socket error:", error);
});
```

### 2.2 Способ 2: Авторизация через cookies

Более безопасный способ - использовать httpOnly cookies.

```typescript
// src/websocket/websocket.gateway.ts
import { JwtService } from "@nestjs/jwt";
import { UnauthorizedException } from "@nestjs/common";

@WebSocketGateway({
	cors: {
		origin: ["http://localhost:3000"],
		credentials: true, // Обязательно для cookies
	},
})
export class WebSocketGateway implements OnGatewayConnection {
	constructor(private jwtService: JwtService) {}

	async handleConnection(client: Socket, ...args: any[]) {
		try {
			// Получаем cookies из handshake
			const cookies = client.handshake.headers.cookie;

			if (!cookies) {
				throw new UnauthorizedException("No cookies provided");
			}

			// Парсим cookies (можно использовать библиотеку cookie-parser)
			const token = this.extractTokenFromCookies(cookies);

			if (!token) {
				throw new UnauthorizedException("No access token in cookies");
			}

			const payload = await this.jwtService.verifyAsync(token);
			client.data.user = payload;

			this.logger.log(`User ${payload.email} connected via cookies`);
		} catch (error) {
			this.logger.error(`Connection rejected: ${error.message}`);
			client.disconnect();
		}
	}

	private extractTokenFromCookies(cookies: string): string | null {
		// Простой парсер cookies
		const cookieArray = cookies.split(";");
		for (const cookie of cookieArray) {
			const [name, value] = cookie.trim().split("=");
			if (name === "accessToken") {
				return value;
			}
		}
		return null;
	}
}
```

### 2.3 Способ 3: Авторизация через заголовки Authorization

```typescript
async handleConnection(client: Socket, ...args: any[]) {
  try {
    // Получаем заголовок Authorization
    const authHeader = client.handshake.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('No authorization header');
    }

    // Извлекаем токен из заголовка "Bearer <token>"
    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    const payload = await this.jwtService.verifyAsync(token);
    client.data.user = payload;

    this.logger.log(`User ${payload.email} connected via auth header`);
  } catch (error) {
    this.logger.error(`Connection rejected: ${error.message}`);
    client.disconnect();
  }
}
```

## Глава 3: Создание кастомного WebSocket Guard

### 3.1 Создание WsAuthGuard

```typescript
// src/websocket/guards/ws-auth.guard.ts
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Socket } from "socket.io";

@Injectable()
export class WsAuthGuard implements CanActivate {
	constructor(private jwtService: JwtService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		try {
			const client: Socket = context.switchToWs().getClient();

			// Если пользователь уже авторизован (из handleConnection)
			if (client.data.user) {
				return true;
			}

			// Если нет - пытаемся авторизовать
			const token = this.extractToken(client);

			if (!token) {
				return false;
			}

			const payload = await this.jwtService.verifyAsync(token);
			client.data.user = payload;

			return true;
		} catch (error) {
			return false;
		}
	}

	private extractToken(client: Socket): string | null {
		// Пытаемся извлечь токен из разных источников

		// 1. Из query параметров
		const queryToken = client.handshake.query.token as string;
		if (queryToken) return queryToken;

		// 2. Из заголовков
		const authHeader = client.handshake.headers.authorization;
		if (authHeader) {
			const token = authHeader.split(" ")[1];
			if (token) return token;
		}

		// 3. Из cookies
		const cookies = client.handshake.headers.cookie;
		if (cookies) {
			return this.extractTokenFromCookies(cookies);
		}

		return null;
	}

	private extractTokenFromCookies(cookies: string): string | null {
		const cookieArray = cookies.split(";");
		for (const cookie of cookieArray) {
			const [name, value] = cookie.trim().split("=");
			if (name === "accessToken") {
				return value;
			}
		}
		return null;
	}
}
```

### 3.2 Использование Guard'а в Gateway

```typescript
// src/websocket/websocket.gateway.ts
import { UseGuards } from "@nestjs/common";
import { WsAuthGuard } from "./guards/ws-auth.guard";

@WebSocketGateway({
	cors: {
		origin: ["http://localhost:3000"],
		credentials: true,
	},
})
export class WebSocketGateway {
	// Применяем Guard ко всем методам
	@UseGuards(WsAuthGuard)
	@SubscribeMessage("message")
	handleMessage(
		@MessageBody() data: any,
		@ConnectedSocket() client: Socket
	): void {
		// Теперь мы гарантированно знаем, что пользователь авторизован
		const user = client.data.user;

		this.server.emit("message", {
			user: { id: user.userId, email: user.email },
			message: data,
			timestamp: new Date().toISOString(),
		});
	}

	// Можно применять Guard избирательно
	@UseGuards(WsAuthGuard)
	@SubscribeMessage("privateMessage")
	handlePrivateMessage(
		@MessageBody() data: { recipientId: string; message: string },
		@ConnectedSocket() client: Socket
	): void {
		const sender = client.data.user;

		// Отправляем сообщение конкретному пользователю
		this.server.to(data.recipientId).emit("privateMessage", {
			sender: { id: sender.userId, email: sender.email },
			message: data.message,
			timestamp: new Date().toISOString(),
		});
	}
}
```

## Глава 4: Продвинутые техники авторизации

### 4.1 Роли и права доступа

```typescript
// src/websocket/guards/ws-role.guard.ts
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Socket } from "socket.io";

@Injectable()
export class WsRoleGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const requiredRoles = this.reflector.get<string[]>(
			"roles",
			context.getHandler()
		);

		if (!requiredRoles) {
			return true; // Если роли не требуются
		}

		const client: Socket = context.switchToWs().getClient();
		const user = client.data.user;

		if (!user) {
			return false;
		}

		// Проверяем, есть ли у пользователя одна из требуемых ролей
		return requiredRoles.some((role) => user.roles?.includes(role));
	}
}

// Создаем декоратор для ролей
import { SetMetadata } from "@nestjs/common";

export const Roles = (...roles: string[]) => SetMetadata("roles", roles);
```

### 4.2 Использование с ролями

```typescript
// src/websocket/websocket.gateway.ts
import { UseGuards } from "@nestjs/common";
import { WsAuthGuard } from "./guards/ws-auth.guard";
import { WsRoleGuard } from "./guards/ws-role.guard";
import { Roles } from "./guards/ws-role.guard";

@WebSocketGateway()
export class WebSocketGateway {
	// Только администраторы могут отправлять системные сообщения
	@UseGuards(WsAuthGuard, WsRoleGuard)
	@Roles("admin")
	@SubscribeMessage("systemMessage")
	handleSystemMessage(
		@MessageBody() data: any,
		@ConnectedSocket() client: Socket
	): void {
		// Отправляем системное сообщение всем
		this.server.emit("systemMessage", {
			message: data,
			timestamp: new Date().toISOString(),
		});
	}

	// Только модераторы и администраторы могут удалять сообщения
	@UseGuards(WsAuthGuard, WsRoleGuard)
	@Roles("moderator", "admin")
	@SubscribeMessage("deleteMessage")
	handleDeleteMessage(
		@MessageBody() data: { messageId: string },
		@ConnectedSocket() client: Socket
	): void {
		// Логика удаления сообщения
		this.server.emit("messageDeleted", { messageId: data.messageId });
	}
}
```

### 4.3 Управление комнатами с авторизацией

```typescript
// src/websocket/websocket.gateway.ts
@WebSocketGateway()
export class WebSocketGateway {
	// Карта для отслеживания пользователей в комнатах
	private userRooms = new Map<string, Set<string>>(); // userId -> Set of room names

	@UseGuards(WsAuthGuard)
	@SubscribeMessage("joinRoom")
	async handleJoinRoom(
		@MessageBody() data: { roomName: string },
		@ConnectedSocket() client: Socket
	): Promise<void> {
		const user = client.data.user;
		const { roomName } = data;

		// Проверяем, может ли пользователь присоединиться к комнате
		if (!this.canJoinRoom(user, roomName)) {
			client.emit("error", "Access denied to this room");
			return;
		}

		// Присоединяем к комнате
		await client.join(roomName);

		// Отслеживаем пользователя в комнате
		if (!this.userRooms.has(user.userId)) {
			this.userRooms.set(user.userId, new Set());
		}
		this.userRooms.get(user.userId)!.add(roomName);

		// Уведомляем всех в комнате о новом участнике
		this.server.to(roomName).emit("userJoined", {
			user: { id: user.userId, email: user.email },
			roomName,
		});

		this.logger.log(`User ${user.email} joined room ${roomName}`);
	}

	@UseGuards(WsAuthGuard)
	@SubscribeMessage("leaveRoom")
	async handleLeaveRoom(
		@MessageBody() data: { roomName: string },
		@ConnectedSocket() client: Socket
	): Promise<void> {
		const user = client.data.user;
		const { roomName } = data;

		await client.leave(roomName);

		// Убираем пользователя из отслеживания
		this.userRooms.get(user.userId)?.delete(roomName);

		this.server.to(roomName).emit("userLeft", {
			user: { id: user.userId, email: user.email },
			roomName,
		});
	}

	@UseGuards(WsAuthGuard)
	@SubscribeMessage("roomMessage")
	handleRoomMessage(
		@MessageBody() data: { roomName: string; message: string },
		@ConnectedSocket() client: Socket
	): void {
		const user = client.data.user;
		const { roomName, message } = data;

		// Проверяем, находится ли пользователь в комнате
		if (!this.userRooms.get(user.userId)?.has(roomName)) {
			client.emit("error", "You are not in this room");
			return;
		}

		// Отправляем сообщение только участникам комнаты
		this.server.to(roomName).emit("roomMessage", {
			user: { id: user.userId, email: user.email },
			message,
			roomName,
			timestamp: new Date().toISOString(),
		});
	}

	private canJoinRoom(user: any, roomName: string): boolean {
		// Логика проверки доступа к комнате
		// Например, приватные комнаты доступны только по приглашению
		if (roomName.startsWith("private_")) {
			return (
				user.roles?.includes("premium") || user.roles?.includes("admin")
			);
		}

		return true; // Публичные комнаты доступны всем
	}

	handleDisconnect(client: Socket) {
		const user = client.data.user;
		if (user) {
			// Очищаем отслеживание пользователя
			this.userRooms.delete(user.userId);
			this.logger.log(`User ${user.email} disconnected`);
		}
	}
}
```

## Глава 5: Безопасность и лучшие практики

### 5.1 Валидация данных

```typescript
// src/websocket/dto/message.dto.ts
import { IsString, IsNotEmpty, MaxLength } from "class-validator";

export class MessageDto {
	@IsString()
	@IsNotEmpty()
	@MaxLength(1000)
	message: string;
}

export class RoomMessageDto {
	@IsString()
	@IsNotEmpty()
	roomName: string;

	@IsString()
	@IsNotEmpty()
	@MaxLength(1000)
	message: string;
}
```

```typescript
// src/websocket/websocket.gateway.ts
import { ValidationPipe } from "@nestjs/common";
import { MessageDto, RoomMessageDto } from "./dto/message.dto";

@WebSocketGateway()
export class WebSocketGateway {
	@UseGuards(WsAuthGuard)
	@SubscribeMessage("message")
	handleMessage(
		@MessageBody(new ValidationPipe()) data: MessageDto,
		@ConnectedSocket() client: Socket
	): void {
		const user = client.data.user;

		// Теперь data гарантированно валидна
		this.server.emit("message", {
			user: { id: user.userId, email: user.email },
			message: data.message,
			timestamp: new Date().toISOString(),
		});
	}
}
```

### 5.2 Rate Limiting

```typescript
// src/websocket/guards/ws-rate-limit.guard.ts
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Socket } from "socket.io";

@Injectable()
export class WsRateLimitGuard implements CanActivate {
	private userMessages = new Map<string, number[]>(); // userId -> timestamps
	private readonly MAX_MESSAGES = 10; // Максимум сообщений
	private readonly TIME_WINDOW = 60000; // За 60 секунд

	canActivate(context: ExecutionContext): boolean {
		const client: Socket = context.switchToWs().getClient();
		const user = client.data.user;

		if (!user) {
			return false;
		}

		const now = Date.now();
		const userId = user.userId;

		// Получаем историю сообщений пользователя
		if (!this.userMessages.has(userId)) {
			this.userMessages.set(userId, []);
		}

		const messages = this.userMessages.get(userId)!;

		// Удаляем старые сообщения (вне временного окна)
		const recentMessages = messages.filter(
			(timestamp) => now - timestamp < this.TIME_WINDOW
		);

		// Проверяем лимит
		if (recentMessages.length >= this.MAX_MESSAGES) {
			client.emit("error", "Rate limit exceeded. Please slow down.");
			return false;
		}

		// Добавляем текущее сообщение
		recentMessages.push(now);
		this.userMessages.set(userId, recentMessages);

		return true;
	}
}
```

### 5.3 Использование Rate Limiting

```typescript
@UseGuards(WsAuthGuard, WsRateLimitGuard)
@SubscribeMessage('message')
handleMessage(
  @MessageBody(new ValidationPipe()) data: MessageDto,
  @ConnectedSocket() client: Socket,
): void {
  // Сообщение будет обработано только если пользователь не превысил лимит
  const user = client.data.user;

  this.server.emit('message', {
    user: { id: user.userId, email: user.email },
    message: data.message,
    timestamp: new Date().toISOString(),
  });
}
```

## Заключение

WebSocket авторизация в NestJS имеет свои особенности, но следуя этим принципам, вы сможете создать безопасную и масштабируемую систему реального времени:

### Ключевые принципы:

1. **Авторизация при подключении** - проверяйте токен в `handleConnection`
2. **Кастомные Guards** - создавайте специальные Guard'ы для WebSocket
3. **Валидация данных** - всегда валидируйте входящие сообщения
4. **Rate Limiting** - защищайтесь от спама
5. **Управление состоянием** - отслеживайте авторизованных пользователей
6. **Безопасность** - используйте httpOnly cookies когда возможно

### Отличия от REST API:

-   Нельзя использовать `@UseGuards(AuthGuard('jwt'))` напрямую
-   Нужно вручную извлекать и проверять токены
-   Важно управлять состоянием долгоживущих соединений
-   Авторизация происходит при подключении, а не при каждом сообщении

Эти техники помогут вам создать надежную систему авторизации для WebSocket-соединений в вашем NestJS приложении.
````

Я создал подробное эссе по авторизации в WebSocket серверах и сохранил его в файле `ASSAY_WEBSOCKET_AUTH_NESTJS.md` в корне вашего проекта.

В эссе я подробно объяснил:

1. **Почему WebSocket авторизация отличается** от REST API
2. **Три основных способа передачи токенов** (query, cookies, headers)
3. **Создание кастомных Guard'ов** для WebSocket
4. **Продвинутые техники** (роли, комнаты, rate limiting)
5. **Безопасность и лучшие практики**

Главное отличие: **нельзя использовать `@UseGuards(AuthGuard('jwt'))` напрямую** в WebSocket, нужно создавать кастомные Guard'ы, которые работают с особенностями WebSocket-соединений.
