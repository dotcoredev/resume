import type { Socket } from "socket.io-client";
import type { ISocketClient } from "../../../api/socket-client/interfaces/socket-client.interface";

export interface ISocketContextValue {
	socket: Socket | null;
	socketClient?: ISocketClient;
	isConnected: boolean;
	clientId: string | undefined;
	connect: () => Promise<void>;
	disconnect: () => void;
	joinRoom: (room: string) => void;
}
