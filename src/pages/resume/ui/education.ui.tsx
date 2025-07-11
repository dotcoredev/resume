import { useI18n } from "../../../shared/hooks/i18n.hook";
import styles from "../styles/education.module.scss";

export const Education = () => {
	const i18n = useI18n();
	return (
		<section className={styles.wrapper}>
			<h2>{i18n.t("education")}</h2>
			<section className={styles.section}>
				<h3>{i18n.t("establishment_1")}</h3>
				<p>{i18n.t("specialty_1")}</p>
				<p>2008 - 2010</p>
			</section>
		</section>
	);
};
