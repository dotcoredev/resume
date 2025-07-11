import { useI18n } from "../../../shared/hooks/i18n.hook";
import styles from "../styles/header.module.scss";

export const Header = () => {
	const i18n = useI18n();

	return (
		<div className={styles.wrapper}>
			<section className={styles.nameDeveloper}>
				<h1>{i18n.t("firstname")}</h1>
				<h1>{i18n.t("lastname")}</h1>
			</section>
			<h3>{i18n.t("specialty_fullstack")}</h3>
		</div>
	);
};
