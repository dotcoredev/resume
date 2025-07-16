import { Header } from "./ui/header.ui";
import styles from "./styles/resume-page.module.scss";
import { Contacts } from "./ui/contacts.ui";
import { Line } from "./ui/line.ui";
import { Education } from "./ui/education.ui";
import { Skills } from "./ui/skills/skills.ui";
import { About } from "./ui/about.ui";
import { WorkExperience } from "./ui/work-experience/work-experience.ui";

export const ResumePage = () => {
	return (
		<div className={styles.wrapper}>
			<section className={styles.header}>
				<Header />
			</section>
			<section className={styles.content}>
				<section className={styles.leftSide}>
					<section className={styles.section}>
						<Contacts />
					</section>
					<Line />
					<section className={styles.section}>
						<Skills />
					</section>
					<Line />
					<section className={styles.section}>
						<Education />
					</section>
				</section>
				<section className={styles.rightSide}>
					<About />
					<Line />
					<WorkExperience />
				</section>
			</section>
		</div>
	);
};
