import React, { type ReactNode } from "react";
import { Provider } from "react-redux";
import { store } from "../store/store";
import { SocketProvider } from "./socket.provider";

export const AppProviders: React.FC<{
	children: ReactNode;
	namespace?: string;
	defaultRoom?: string;
	autoConnect?: boolean;
}> = ({ children, namespace = "/", defaultRoom = "", autoConnect = false }) => {
	return (
		<Provider store={store}>
			<SocketProvider
				namespace={namespace}
				autoConnect={autoConnect}
				defaultRoom={defaultRoom}
			>
				{children}
			</SocketProvider>
		</Provider>
	);
};
