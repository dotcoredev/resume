import React, { type ReactNode } from "react";
import { SocketProvider } from "./socket.provider";
import { StoreProvider } from "./store.provider";

export const AppProviders: React.FC<{
	children: ReactNode;
	namespace?: string;
	defaultRoom?: string;
	autoConnect?: boolean;
}> = ({ children, namespace = "/", defaultRoom = "", autoConnect = false }) => {
	return (
		<StoreProvider>
			<SocketProvider
				namespace={namespace}
				autoConnect={autoConnect}
				defaultRoom={defaultRoom}
			>
				{children}
			</SocketProvider>
		</StoreProvider>
	);
};
