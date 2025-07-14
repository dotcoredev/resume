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
	private maxReconnectAttempts = 5;
	private reconnectTimer: number | null = null;

	get getSocket(): Socket | null {
		return this.socket;
	}

	// Подключение к серверу
	connect(namespace: string): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				this.manager = new Manager(
					SOCKET_CONFIG.url,
					SOCKET_CONFIG.options as Partial<ManagerOptions>
				); // Создаем менеджер с указанным URL и опциями
				this.socket = this.manager.socket(namespace); // Создаем сокет для указанного пространства имен
				this.socket.connect(); // Запускаем подключение

				this.socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
					// Обрабатываем отключение
					console.log(
						"❌ Disconnected from WebSocket server:",
						reason
					);
					this.handleReconnection(); // Обрабатываем переподключение
				});

				this.socket.on(SOCKET_EVENTS.CONNECT, () => {
					console.log("✅ Connected to WebSocket server");
					this.reconnectAttempts = 0; // Сбрасываем счетчик попыток переподключения
					resolve();
				});

				this.socket.on("connect_error", (error) => {
					// Обрабатываем ошибку подключения
					console.error("❌ Connection error:", error);
					reject(error);
				});
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
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer);
		}

		if (this.reconnectAttempts < this.maxReconnectAttempts) {
			this.reconnectAttempts++;
			console.log(
				`🔄 Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
			);

			const delay = exponentialJitter(this.reconnectAttempts, 500, 2000); // Вычисляем задержку с экспоненциальным джиттером

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
		this.emit(SOCKET_EVENTS.JOIN_TODO_ROOM, { room });
	}

	// Проверка состояния подключения
	get connected(): boolean {
		return this.socket?.connected ?? false;
	}

	// Получение ID клиента
	get clientId(): string | undefined {
		return this.socket?.id;
	}
}

// Singleton instance
export const socketClient = new SocketClient();
