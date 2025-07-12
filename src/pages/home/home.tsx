import { useEffect, useRef } from "react";
import { Canvas } from "./lib/canvas/canvas";
import styles from "./styles/home.module.scss";

export const HomePage = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const canvas = new Canvas();

	useEffect(() => {
		if (canvasRef.current) {
			canvas.init(canvasRef.current).run();
		}

		return () => {
			canvas.unsubscribeEvents();
		};
	}, [canvas, canvasRef]);

	return (
		<canvas className={styles.canvas} ref={canvasRef}>
			canvas
		</canvas>
	);
};
