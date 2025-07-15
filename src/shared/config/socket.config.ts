export const SOCKET_CONFIG = {
	url: import.meta.env.VITE_SOCKET_URL,
	options: {
		autoConnect: false, // Устанавливаем autoConnect в false, чтобы управлять подключением вручную
		transports: ["websocket"], // Используем только WebSocket транспорт
		timeout: 20000, // Таймаут подключения
		reconnection: false,
		reconnectionAttempts: 5, // Максимальное количество попыток переподключения
		reconnectionDelay: 1000, // Задержка между попытками переподключения
	},
};

export const SOCKET_EVENTS = {
	// Системные события
	CONNECT: "connect",
	DISCONNECT: "disconnect",
	CONNECTION: "connection",
	CONNECT_ERROR: "connect_error",

	// Todo события
	TODO_CREATED: "todoCreated",
	TODO_UPDATED: "todoUpdated",
	TODO_DELETED: "todoDeleted",

	// Комнаты
	JOIN_TODO_ROOM: "joinTodoRoom",
	JOINED_ROOM: "joinedRoom",
} as const;
