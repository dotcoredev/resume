export const SOCKET_CONFIG = {
	url: import.meta.env.VITE_SOCKET_URL,
	options: {
		autoConnect: false,
		transports: ["websocket"],
		timeout: 20000,
		reconnection: true,
		reconnectionAttempts: 5,
		reconnectionDelay: 1000,
	},
};

export const SOCKET_EVENTS = {
	// Системные события
	CONNECT: "connect",
	DISCONNECT: "disconnect",
	CONNECTION: "connection",

	// Todo события
	TODO_CREATED: "todoCreated",
	TODO_UPDATED: "todoUpdated",
	TODO_DELETED: "todoDeleted",

	// Комнаты
	JOIN_TODO_ROOM: "joinTodoRoom",
	JOINED_ROOM: "joinedRoom",
} as const;
