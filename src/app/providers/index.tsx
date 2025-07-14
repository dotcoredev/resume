import React, { type ReactNode } from "react";
import { Provider } from "react-redux";
import { store } from "../store/store";
import { SocketProvider } from "./socket.provider";

export const AppProviders: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	return (
		<Provider store={store}>
			<SocketProvider
				namespace="/todos"
				autoConnect={false}
				defaultRoom="general"
			>
				{children}
			</SocketProvider>
		</Provider>
	);
};
