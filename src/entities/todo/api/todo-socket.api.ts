import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSocket } from "../../../shared/libs/socket-context/socket-context";
import { SOCKET_EVENTS } from "../../../shared/config/socket.config";
import {
	addTodoFromSocket,
	updateTodoFromSocket,
	deleteTodoFromSocket,
} from "../model/store.todo";
import type { TodoSocketEvent } from "../interfaces/todo.interface";

export const useTodoSocketEvents = () => {
	const { socket } = useSocket();
	const dispatch = useDispatch();

	useEffect(() => {
		// Обработчик создания todo
		const handleTodoCreated = (event: TodoSocketEvent) => {
			console.log("📝 Todo created via WebSocket:", event.data);
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			dispatch(addTodoFromSocket(event.data as any));
		};

		// Обработчик обновления todo
		const handleTodoUpdated = (event: TodoSocketEvent) => {
			console.log("✏️ Todo updated via WebSocket:", event.data);
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			dispatch(updateTodoFromSocket(event.data as any));
		};

		// Обработчик удаления todo
		const handleTodoDeleted = (event: TodoSocketEvent) => {
			console.log("🗑️ Todo deleted via WebSocket:", event.data);
			const todoId = (event.data as { id: string }).id;
			dispatch(deleteTodoFromSocket(todoId));
		};

		// Подписываемся на события
		if (socket) {
			socket.on(SOCKET_EVENTS.TODO_CREATED, handleTodoCreated);
			socket.on(SOCKET_EVENTS.TODO_UPDATED, handleTodoUpdated);
			socket.on(SOCKET_EVENTS.TODO_DELETED, handleTodoDeleted);
		}

		// Cleanup при размонтировании
		return () => {
			if (socket) {
				socket.off(SOCKET_EVENTS.TODO_CREATED, handleTodoCreated);
				socket.off(SOCKET_EVENTS.TODO_UPDATED, handleTodoUpdated);
				socket.off(SOCKET_EVENTS.TODO_DELETED, handleTodoDeleted);
			}
		};
	}, [socket, dispatch]);
};
