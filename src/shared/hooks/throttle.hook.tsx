import { useRef } from "react";

export const useThrottle = (fn: () => void, delay: number) => {
	const timer = useRef<number | null>(null);

	const throttle = () => {
		if (timer.current) return;

		timer.current = setTimeout(() => {
			fn();
			timer.current = null;
		}, delay);
	};

	return throttle;
};
