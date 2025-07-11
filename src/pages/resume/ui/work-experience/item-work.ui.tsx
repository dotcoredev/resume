import type { IWorkExperience } from "../../interfaces/work-experience.interface";
import styles from "../../styles/work-experience.module.scss";

export const WorkItem = ({
	work,
	devider,
}: {
	work: IWorkExperience;
	devider?: React.ReactNode;
}) => {
	return (
		<section className={styles.workItem}>
			<h2>{work.name}</h2>
			<section className={styles.information}>
				<p>
					{work.company_name} - {work.period}
				</p>
			</section>
			<section
				className={styles.desc}
				dangerouslySetInnerHTML={{
					__html:
						typeof work.desc === "function"
							? work.desc()
							: work.desc,
				}}
			/>
			{devider}
		</section>
	);
};
