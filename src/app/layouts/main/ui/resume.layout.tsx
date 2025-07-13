import { Outlet } from "react-router";
import styles from "../styles/resume-layout.module.scss";

export const ResumeLayout = () => {
	return (
		<main className={styles.scrollbarSection}>
			<section className={styles.wrapper}>
				<Outlet />
			</section>
		</main>
	);
};
