import { useRef } from "react";

export const useDebounce = (fn: () => void, delay: number) => {
	const timer = useRef<number | null>(null);

	const debounce = () => {
		if (timer.current) {
			clearTimeout(timer.current);
		}

		timer.current = setTimeout(() => {
			fn();
		}, delay);
	};

	return debounce;
};
