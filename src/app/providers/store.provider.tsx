import type { FC, ReactNode } from "react";
import { Provider } from "react-redux";
import { store } from "../store/store";

export const StoreProvider: FC<{ children: ReactNode }> = ({ children }) => {
	return <Provider store={store}>{children}</Provider>;
};
