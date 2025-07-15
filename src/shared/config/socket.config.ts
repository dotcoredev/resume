export const SOCKET_CONFIG = {
	url: import.meta.env.VITE_SOCKET_URL,
	options: {
		// Опции подключения к WebSocket серверу
		autoConnect: false, // Устанавливаем autoConnect в false, чтобы управлять подключением вручную
		transports: ["websocket"], // Используем только WebSocket транспорт
		timeout: 20000, // Таймаут подключения

		// Опции переподключения
		// Эти опции позволяют управлять поведением переподключения
		// при потере соединения с сервером
		// Они позволяют автоматически переподключаться к серверу
		// с заданной задержкой и количеством попыток
		// Это полезно для обеспечения устойчивости приложения
		reconnectionDelay: 1000, // Задержка между попытками
		reconnectionAttempts: 5, // Максимальное количество попыток переподключения
		reconnectionDelayMax: 5000, // Максимальная задержка между попытками переподключения
		randomizationFactor: 0.5, // Фактор рандомизации для задержки переподключения jitter
		reconnection: true,
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
