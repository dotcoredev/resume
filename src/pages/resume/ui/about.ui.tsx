import { memo } from "react";
import { useI18n } from "../../../shared/hooks/i18n.hook";
import styles from "../styles/about.module.scss";

export const About = memo(() => {
	const i18n = useI18n();

	return (
		<section className={styles.wrapper}>
			<h2>{i18n.t("about_title")}</h2>
			<section
				className={styles.content}
				dangerouslySetInnerHTML={{ __html: i18n.t("about") }}
			/>
		</section>
	);
});
