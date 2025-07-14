import { configureStore } from "@reduxjs/toolkit";
import todoReducer from "../../entities/todo/model/store.todo";

export const store = configureStore({
	reducer: {
		todos: todoReducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
			},
		}),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
