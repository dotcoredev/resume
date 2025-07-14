import { createContext, useContext } from "react";
import type { ISocketContextValue } from "./interfaces/socket-context.interface";

export const SocketContext = createContext<ISocketContextValue | null>(null);

export const useSocket = (): ISocketContextValue => {
	const context = useContext(SocketContext);
	if (!context) {
		throw new Error("useSocket must be used within SocketProvider");
	}
	return context;
};
