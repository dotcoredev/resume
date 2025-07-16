import { memo, useEffect, useRef, type FC } from "react";
import styles from "../../styles/skills.module.scss";
import { IconSkillCanvas } from "../../lib/icon-skill-canvas/icon-skill-canvas";

export const IconSkill: FC<{ isAnimating?: boolean; iconSrc: string }> = memo(
	({ isAnimating, iconSrc }) => {
		const canvasRef = useRef<HTMLCanvasElement>(null);
		const parentRef = useRef<HTMLDivElement>(null);

		useEffect(() => {
			if (isAnimating && canvasRef.current && parentRef.current) {
				new IconSkillCanvas(canvasRef.current, 70, 70, iconSrc).start();
			}
		}, [isAnimating, canvasRef, parentRef, iconSrc]);

		return (
			<section ref={parentRef} className={styles.icon}>
				{isAnimating && (
					<canvas ref={canvasRef}>canvas not supported</canvas>
				)}
			</section>
		);
	}
);
