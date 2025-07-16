import { useEffect, useState, type FC } from "react";
import styles from "../../styles/skills.module.scss";
import type { ISkill } from "../../interfaces/skills.interface";
import { IconSkill } from "./icon-skill.ui";

export const ItemSkill: FC<{ item: ISkill }> = ({ item }) => {
	const [hovered, setHovered] = useState(false);
	const [shouldRender, setShouldRender] = useState(false);

	const hoverEvent = (status: boolean) => {
		setHovered(status);
	};

	useEffect(() => {
		if (hovered) {
			setTimeout(() => setShouldRender(true), 10);
		} else {
			setTimeout(() => setShouldRender(false), 10);
		}
	}, [hovered]);

	return (
		<section
			className={styles.skill}
			key={item.id}
			onMouseEnter={() => hoverEvent(true)}
			onMouseLeave={() => hoverEvent(false)}
		>
			<p>{item.title}</p>
			<IconSkill iconSrc={item.icon} isAnimating={shouldRender} />
		</section>
	);
};
