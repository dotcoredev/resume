import React from "react";
import { TodoList } from "../../../features/todo-list/ui/todo-list";
import { useSocket } from "../../../shared/libs/socket-context/socket-context";
import { Seo } from "../../../shared/ui/helmet";

export const TodoPage: React.FC = () => {
	const { isConnected, connect, disconnect } = useSocket();

	return (
		<div className="todos-page">
			<Seo
				title="Todo real-time"
				description="Управление todo листо в реалтайме"
			/>
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

			{isConnected ? (
				<main className="todos-page__content">
					<TodoList />
				</main>
			) : (
				<div className="todos-page__disconnected">
					<p>
						Please connect to the WebSocket server to view and
						manage your todos.
					</p>
				</div>
			)}
		</div>
	);
};
