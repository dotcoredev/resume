import { configureStore } from "@reduxjs/toolkit";
import todoReducer from "../../entities/todo/model/store.todo";
import learningReducer from "../../pages/learning/model/store.learning";

export const store = configureStore({
	reducer: {
		todos: todoReducer,
		learning: learningReducer,
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
