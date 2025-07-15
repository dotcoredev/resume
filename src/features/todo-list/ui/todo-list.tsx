import { useSelector } from "react-redux";
import { useSocket } from "../../../shared/libs/socket-context/socket-context";
import { useTodoSocketEvents } from "../../../entities/todo/api/todo-socket.api";
import type { ITodoReducerState } from "../interfaces/todo-list.interface";
import { useDebounce } from "../../../shared/hooks/debounce.hook";

export const TodoList: React.FC = () => {
	const { isConnected, clientId, socketClient } = useSocket();
	const {
		items: todos,
		loading,
		error,
		lastUpdate,
	} = useSelector((state: ITodoReducerState) => state.todos);
	const debounce = useDebounce((room: string) => {
		socketClient.joinRoom(room);
	}, 1000);

	// Подключаем WebSocket события для todo
	useTodoSocketEvents();

	const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		debounce(value);
	};

	if (loading) {
		return <div className="loading">Loading todos...</div>;
	}

	if (error) {
		return <div className="error">Error: {error}</div>;
	}

	return (
		<div className="todo-list">
			<div className="todo-list__header">
				<h2>Todo List</h2>

				{isConnected && (
					<div>
						<input
							placeholder="Enter room title"
							onChange={onChange}
						/>
					</div>
				)}

				<div className="connection-status">
					<span
						className={`status ${
							isConnected ? "connected" : "disconnected"
						}`}
					>
						{isConnected ? "🟢 Connected" : "🔴 Disconnected"}
					</span>
					{clientId && (
						<span className="client-id">ID: {clientId}</span>
					)}
				</div>
			</div>

			{lastUpdate && (
				<div className="last-update">
					Last update: {new Date(lastUpdate).toLocaleTimeString()}
				</div>
			)}

			<div className="todo-items">
				{todos.length === 0 ? (
					<div className="empty-state">
						<p>No todos yet. Create your first todo!</p>
					</div>
				) : (
					todos.map((todo) => (
						<div
							key={todo._id}
							className={`todo-item ${
								todo.completed ? "completed" : ""
							}`}
						>
							<div className="todo-content">
								<h3>{todo.title}</h3>
								{todo.description && <p>{todo.description}</p>}
								<div className="todo-meta">
									<span>
										Created:{" "}
										{new Date(
											todo.createdAt
										).toLocaleDateString()}
									</span>
									<span
										className={`status ${
											todo.completed
												? "completed"
												: "pending"
										}`}
									>
										{todo.completed
											? "✅ Completed"
											: "⏳ Pending"}
									</span>
								</div>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
};
