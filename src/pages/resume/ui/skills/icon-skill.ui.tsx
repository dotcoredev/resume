import { memo, useEffect, useRef, type FC } from "react";
import styles from "../../styles/skills.module.scss";
import { IconSkillCanvas } from "../../lib/icon-skill-canvas/icon-skill-canvas";
import type { ICanvas } from "../../interfaces/canvas.interface";

export const IconSkill: FC<{ isAnimating?: boolean; iconSrc: string }> = memo(
	({ isAnimating, iconSrc }) => {
		const canvasRef = useRef<HTMLCanvasElement>(null);
		const parentRef = useRef<HTMLDivElement>(null);
		const iconSkillCanvas = useRef<ICanvas>(new IconSkillCanvas());

		useEffect(() => {
			const canvas = iconSkillCanvas.current;
			if (isAnimating && canvasRef.current && parentRef.current) {
				canvas.init(canvasRef.current, 70, 70, iconSrc).start();
			} else {
				canvas.stop();
			}
		}, [isAnimating, iconSrc]);

		return (
			<section ref={parentRef} className={styles.icon}>
				{isAnimating && (
					<canvas ref={canvasRef}>{"canvas not supported"}</canvas>
				)}
			</section>
		);
	}
);
