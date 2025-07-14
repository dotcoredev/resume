import type { Socket } from "socket.io-client";

export interface ISocketContextValue {
	socket: Socket | null;
	isConnected: boolean;
	clientId?: string;
	connect: () => Promise<void>;
	disconnect: () => void;
	joinRoom: (room: string) => void;
}
