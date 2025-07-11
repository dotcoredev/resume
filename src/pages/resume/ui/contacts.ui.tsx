import { useI18n } from "../../../shared/hooks/i18n.hook";
import styles from "../styles/contacts.module.scss";
import {
	LiaEnvelopeSolid,
	LiaLinkedinIn,
	LiaPhoneAltSolid,
	LiaTelegramPlane,
} from "react-icons/lia";

export const Contacts = () => {
	const i18n = useI18n();

	return (
		<section className={styles.wrapper}>
			<a href={`tel:${i18n.t("phone")}`} className={styles.section}>
				<LiaPhoneAltSolid
					className={`${styles.icon} ${styles.iconPhone}`}
				/>
				<p>{i18n.t("phone")}</p>
			</a>
			<a className={styles.section} href={`to:${i18n.t("email")}`}>
				<LiaEnvelopeSolid className={`${styles.icon}`} />
				<p>{i18n.t("email")}</p>
			</a>
			<a
				target="_blank"
				className={styles.section}
				href={`${i18n.t("telegram_link")}`}
			>
				<LiaTelegramPlane className={`${styles.icon}`} />
				<p>{i18n.t("telegram")}</p>
			</a>
			<a
				target="_blank"
				className={styles.section}
				href={`${i18n.t("linkedin")}`}
			>
				<LiaLinkedinIn className={`${styles.icon}`} />
				<p>linkedin</p>
			</a>
		</section>
	);
};
