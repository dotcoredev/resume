import { Manager, Socket, type ManagerOptions } from "socket.io-client";
import { SOCKET_CONFIG, SOCKET_EVENTS } from "../../config/socket.config";
import type {
	ISocketClient,
	SocketEventCallback,
} from "./interfaces/socket-client.interface";
import { exponentialJitter } from "../../utils/time";

class SocketClient implements ISocketClient {
	private socket: Socket | null = null;
	private manager: Manager | null = null;
	private reconnectAttempts = 0;
	private maxReconnectAttempts = 7;
	private reconnectTimer: number | null = null;
	private rooms: Set<string> = new Set();

	// Подключение к серверу
	connect(namespace: string): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				this.manager = new Manager(
					SOCKET_CONFIG.url,
					SOCKET_CONFIG.options as Partial<ManagerOptions>
				); // Создаем менеджер с указанным URL и опциями
				this.socket = this.manager.socket(namespace); // Создаем сокет для указанного пространства имен
				this.socket.removeAllListeners(); // Удаляем все предыдущие обработчики событий
				this.socket.connect(); // Запускаем подключение

				this.socket.on(SOCKET_EVENTS.CONNECT, () => {
					console.log("✅ Connected to WebSocket server");
					this.joiningRooms();
					this.reconnectAttempts = 0; // Сбрасываем счетчик попыток переподключения
					resolve();
				});

				// Единый обработчик для всех типов отключений
				const handleConnectionFailure = (reason: string | Error) => {
					console.log("❌ Connection failed:", reason);
					// Запускаем переподключение для всех случаев
					this.handleReconnection();
				};

				this.socket.on(
					SOCKET_EVENTS.DISCONNECT,
					handleConnectionFailure
				);
				this.socket.on(
					SOCKET_EVENTS.CONNECT_ERROR,
					handleConnectionFailure
				);
			} catch (error) {
				reject(error);
			}
		});
	}

	// Отключение от сервера
	disconnect(): void {
		if (this.socket) {
			this.socket.disconnect();
			this.socket = null;
			console.log("🔌 Manually disconnected from WebSocket server");
		}
	}

	// Обработка переподключения
	private handleReconnection(): void {
		console.log("🔄 Start attempting to reconnect...");
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer);
		}

		if (this.reconnectAttempts < this.maxReconnectAttempts) {
			this.reconnectAttempts++;
			console.log(
				`🔄 Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
			);

			const delay = exponentialJitter(this.reconnectAttempts, 200, 700); // Вычисляем задержку с экспоненциальным джиттером

			this.reconnectTimer = setTimeout(() => {
				if (this.socket && !this.socket.connected) {
					this.socket.connect();
				}
			}, delay);
		} else {
			console.error("❌ Max reconnection attempts reached");
			this.reconnectAttempts = 0; // Сбрасываем счетчик попыток
		}
	}

	// Подписка на события
	on(event: string, callback: SocketEventCallback): void {
		if (this.socket) {
			this.socket.on(event, callback);
		}
	}

	// Отписка от событий
	off(event: string, callback?: SocketEventCallback): void {
		if (this.socket) {
			this.socket.off(event, callback);
		}
	}

	// Отправка события
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	emit(event: string, data?: any): void {
		if (this.socket && this.socket.connected) {
			this.socket.emit(event, data);
		} else {
			console.warn("⚠️ Socket not connected. Cannot emit event:", event);
		}
	}

	// Присоединение к комнате
	joinRoom(room: string): void {
		if (room.trim() === "") {
			console.warn("⚠️ Room name cannot be empty");
			return;
		}
		this.rooms.add(room);
		this.joiningRooms();
	}

	joiningRooms(): void {
		if (this.rooms.size === 0) return;
		this.rooms.forEach((room) => {
			console.log(`Joining room: ${room}`);
			this.emit(SOCKET_EVENTS.JOIN_TODO_ROOM, { room });
		});
	}

	// Проверка состояния подключения
	get connected(): boolean {
		return this.socket?.connected ?? false;
	}

	// Получение ID клиента
	get clientId(): string | undefined {
		return this.socket?.id;
	}

	get getSocket(): Socket | null {
		return this.socket;
	}
}

// Singleton instance
export const socketClient = new SocketClient();
