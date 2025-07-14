import type { ReactNode } from "react";

export interface ISocketProviderProps {
	children: ReactNode;
	autoConnect?: boolean;
	defaultRoom?: string;
	namespace: string;
}
