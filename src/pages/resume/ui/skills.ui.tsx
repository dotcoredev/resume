import { useI18n } from "../../../shared/hooks/i18n.hook";
import { SkillsList } from "../model/skills-list.model";
import styles from "../styles/skills.module.scss";

export const Skills = () => {
	const i18n = useI18n();

	return (
		<section className={styles.wrapper}>
			<h2>{i18n.t("skills")}</h2>
			<section className={styles.section}>
				{SkillsList.sort((a, b) => a.sort - b.sort).map((item) => (
					<section className={styles.skill} key={item.id}>
						<p>{item.title}</p>
					</section>
				))}
			</section>
		</section>
	);
};
