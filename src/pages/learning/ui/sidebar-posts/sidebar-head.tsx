import { useAppDispatch } from "../../../../shared/hooks/redux.hook";
import { toggleSidebar } from "../../model/store.learning";
import styles from "../../styles/sidebar-posts.module.scss";
import { FaWindowClose } from "react-icons/fa";

export const SidebarHead = () => {
	const dispatch = useAppDispatch();
	return (
		<header className={styles.header}>
			<FaWindowClose
				className={styles.closeIcon}
				onClick={() => dispatch(toggleSidebar())}
			/>
			<h1>Статьи.</h1>
		</header>
	);
};
