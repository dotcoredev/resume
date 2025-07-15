import { useCallback, useEffect, useMemo, useState } from "react";
import { socketClient } from "../../shared/api/socket-client";
import { SOCKET_EVENTS } from "../../shared/config/socket.config";
import type { ISocketContextValue } from "../../shared/libs/socket-context/interfaces/socket-context.interface";
import type { ISocketProviderProps } from "./interfaces/socker-provider.interface";
import { SocketContext } from "../../shared/libs/socket-context/socket-context";

export const SocketProvider: React.FC<ISocketProviderProps> = ({
	children,
	autoConnect = false,
	defaultRoom = "general",
	namespace = "/",
}) => {
	const [isConnected, setIsConnected] = useState(false);
	const [clientId, setClientId] = useState<string | undefined>();

	// Подключение к серверу
	const connect = useCallback(async () => {
		try {
			await socketClient.connect(namespace);
			setIsConnected(true);
			setClientId(socketClient.clientId);

			// Автоматически присоединяемся к комнате по умолчанию
			if (defaultRoom) {
				console.log(`Joining room: ${defaultRoom}`);
				socketClient.joinRoom(defaultRoom);
			}
		} catch (error) {
			console.error("Failed to connect to WebSocket server:", error);
			setIsConnected(false);
		}
	}, [defaultRoom, namespace]);

	// Отключение от сервера
	const disconnect = useCallback(() => {
		socketClient.disconnect();
		setIsConnected(false);
		setClientId(undefined);
	}, []);

	// Присоединение к комнате
	const joinRoom = useCallback((room: string) => {
		socketClient.joinRoom(room);
	}, []);

	useEffect(() => {
		// Автоподключение
		if (autoConnect) {
			connect();
		}

		return () => {
			if (autoConnect) {
				disconnect();
			}
		};
	}, [autoConnect, connect, disconnect]);

	// Обработчики системных событий
	useEffect(() => {
		const handleConnect = () => {
			setIsConnected(true);
			setClientId(socketClient.clientId);
		};

		const handleDisconnect = () => {
			setIsConnected(false);
			setClientId(undefined);
		};

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const handleConnection = (data: any) => {
			console.log("🎉 Connection acknowledged:", data);
		};

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const handleJoinedRoom = (data: any) => {
			console.log("🏠 Joined room:", data);
		};

		// Подписываемся на события
		socketClient.on(SOCKET_EVENTS.CONNECT, handleConnect);
		socketClient.on(SOCKET_EVENTS.DISCONNECT, handleDisconnect);
		socketClient.on(SOCKET_EVENTS.CONNECTION, handleConnection);
		socketClient.on(SOCKET_EVENTS.JOINED_ROOM, handleJoinedRoom);

		// Cleanup при размонтировании
		return () => {
			socketClient.off(SOCKET_EVENTS.CONNECT, handleConnect);
			socketClient.off(SOCKET_EVENTS.DISCONNECT, handleDisconnect);
			socketClient.off(SOCKET_EVENTS.CONNECTION, handleConnection);
			socketClient.off(SOCKET_EVENTS.JOINED_ROOM, handleJoinedRoom);
		};
	}, [isConnected]);

	// Мемоизированное значение контекста
	const contextValue = useMemo<ISocketContextValue>(
		() => ({
			socket: socketClient.getSocket,
			socketClient,
			isConnected,
			clientId,
			connect,
			disconnect,
			joinRoom,
		}),
		[isConnected, clientId, connect, disconnect, joinRoom]
	);

	return (
		<SocketContext.Provider value={contextValue}>
			{children}
		</SocketContext.Provider>
	);
};
