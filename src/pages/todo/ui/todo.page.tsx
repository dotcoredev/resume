import React from "react";
import { TodoList } from "../../../features/todo-list/ui/todo-list";
import { useSocket } from "../../../shared/libs/socket-context/socket-context";

export const TodoPage: React.FC = () => {
	const { isConnected, connect, disconnect } = useSocket();

	return (
		<div className="todos-page">
			<header className="todos-page__header">
				<h1>📝 Real-time Todos</h1>
				<div className="connection-controls">
					{!isConnected ? (
						<button onClick={connect} className="btn btn-primary">
							Connect to WebSocket
						</button>
					) : (
						<button
							onClick={disconnect}
							className="btn btn-secondary"
						>
							Disconnect
						</button>
					)}
				</div>
			</header>

			<main className="todos-page__content">
				<TodoList />
			</main>
		</div>
	);
};
