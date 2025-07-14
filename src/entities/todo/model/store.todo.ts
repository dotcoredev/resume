import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Todo, TodoState } from "../interfaces/todo.interface";

const initialState: TodoState = {
	items: [],
	loading: false,
	error: null,
	lastUpdate: null,
};

export const todoSlice = createSlice({
	name: "todos",
	initialState,
	reducers: {
		// Установка списка todos
		setTodos: (state, action: PayloadAction<Todo[]>) => {
			state.items = action.payload;
			state.lastUpdate = new Date().toISOString();
		},

		// Добавление нового todo (от WebSocket)
		addTodoFromSocket: (state, action: PayloadAction<Todo>) => {
			const existingIndex = state.items.findIndex(
				(todo) => todo._id === action.payload._id
			);

			if (existingIndex === -1) {
				state.items.unshift(action.payload); // Добавляем в начало
				state.lastUpdate = new Date().toISOString();
			}
		},

		// Обновление todo (от WebSocket)
		updateTodoFromSocket: (state, action: PayloadAction<Todo>) => {
			const index = state.items.findIndex(
				(todo) => todo._id === action.payload._id
			);

			if (index !== -1) {
				state.items[index] = action.payload;
				state.lastUpdate = new Date().toISOString();
			}
		},

		// Удаление todo (от WebSocket)
		deleteTodoFromSocket: (state, action: PayloadAction<string>) => {
			state.items = state.items.filter(
				(todo) => todo._id !== action.payload
			);
			state.lastUpdate = new Date().toISOString();
		},

		// Управление состоянием загрузки
		setLoading: (state, action: PayloadAction<boolean>) => {
			state.loading = action.payload;
		},

		// Управление ошибками
		setError: (state, action: PayloadAction<string | null>) => {
			state.error = action.payload;
		},
	},
});

export const {
	setTodos,
	addTodoFromSocket,
	updateTodoFromSocket,
	deleteTodoFromSocket,
	setLoading,
	setError,
} = todoSlice.actions;

export default todoSlice.reducer;
