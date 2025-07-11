import { Outlet } from "react-router";
import styles from "./styles/main-layout.module.scss";

export const MainLayout = () => {
	return (
		<div className={styles.wrapper}>
			<Outlet />
		</div>
	);
};
