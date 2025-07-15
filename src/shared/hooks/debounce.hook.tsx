import { useRef } from "react";

export const useDebounce = <T extends unknown[]>(
	fn: (...args: T) => void,
	delay: number
) => {
	const timer = useRef<number | null>(null);

	const debounce = (...args: T) => {
		if (timer.current) {
			clearTimeout(timer.current);
		}

		timer.current = window.setTimeout(() => {
			fn(...args);
		}, delay);
	};

	return debounce;
};
