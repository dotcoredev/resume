import { useMemo } from "react";
import styles from "../styles/resume-page.module.scss";

export const Line = ({ special = false }: { special?: boolean }) => {
	const style = useMemo(
		() =>
			special
				? {
						width: "20%",
						border: "none",
						height: 2,
						background: "#7a950c",
				  }
				: {},
		[special]
	);
	return <div style={style} className={styles.line} />;
};
