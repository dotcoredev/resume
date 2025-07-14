// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SocketEventCallback = (data: any) => void;

export interface ISocketClient {
	readonly connected: boolean;
	connect(namespace?: string): Promise<void>;
	disconnect(): void;
	on(event: string, callback: SocketEventCallback): void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	emit(event: string, data?: any): void;
	off(event: string, callback?: SocketEventCallback): void;
	joinRoom(room: string): void;
}
