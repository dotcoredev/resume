import type { Socket } from "socket.io-client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SocketEventCallback = (data: any) => void;

export interface ISocketClient {
	connected: boolean;
	getSocket: Socket | null;
	connect(namespace?: string): Promise<void>;
	disconnect(): void;
	on(event: string, callback: SocketEventCallback): void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	emit(event: string, data?: any): void;
	off(event: string, callback?: SocketEventCallback): void;
	joinRoom(room: string): void;
}
