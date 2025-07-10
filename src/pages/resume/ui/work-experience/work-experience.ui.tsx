import { useI18n } from "../../../../shared/hooks/i18n.hook";
import type { IWorkExperience } from "../../interfaces/work-experience.interface";
import { workExperienceList } from "../../model/work-experience.model";
import styles from "../../styles/work-experience.module.scss";
import { Line } from "../line.ui";
import { WorkItem } from "./item-work.ui";

export const WorkExperience = () => {
	const i18n = useI18n();

	return (
		<section className={styles.wrapper}>
			<h2>{i18n.t("work_experience_title")}</h2>
			<section className={styles.content}>
				<section className={styles.works}>
					{workExperienceList
						.sort((a, b) => a.sort - b.sort)
						.map((work: IWorkExperience) => (
							<WorkItem
								devider={
									work.id !== workExperienceList.length && (
										<Line special />
									)
								}
								key={work.id}
								work={work}
							/>
						))}
				</section>
			</section>
		</section>
	);
};
