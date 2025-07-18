import { useEffect, useRef } from "react";
import { Canvas } from "../lib/canvas/canvas";
import styles from "../styles/home.module.scss";
import { useNavigate } from "react-router";
import { Seo } from "../../../shared/ui/helmet";

export const HomePage = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const canvas = useRef(new Canvas()).current;
	const navigate = useNavigate();

	useEffect(() => {
		if (canvasRef.current) {
			canvas.init(canvasRef.current).run();
		}

		return () => {
			canvas.unsubscribeEvents();
		};
	}, [canvas, canvasRef]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			console.log("Key pressed:", e.key);
			if (e.key.toLowerCase() === "r") {
				navigate("/resume");
			} else if (e.key.toUpperCase() === "P") {
				navigate("/learning");
			} else if (e.key.toLowerCase() === "c") {
				navigate("/chat");
			}
		};

		window.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [navigate]);

	return (
		<section className={styles.wrapper}>
			<Seo title="Dotcore." description="Dotcore" />
			<canvas className={styles.canvas} ref={canvasRef}>
				canvas
			</canvas>
			<h1 className={styles.title}>Dotcore.</h1>
		</section>
	);
};
