import { useNavigate } from "react-router";
import { pages } from "../../model/pages";
import styles from "../../styles/sidebar-posts.module.scss";
import { SidebarHead } from "./sidebar-head";
import {
	useAppDispatch,
	useAppSelector,
} from "../../../../shared/hooks/redux.hook";
import { toggleSidebar } from "../../model/store.learning";
import { useEffect, useRef } from "react";
import { SidebarCanvas } from "../../lib/canvas/sidebar.canvas";

export const SidebarPosts = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const navigate = useNavigate();
	const { sidebar_Status } = useAppSelector((state) => state.learning);
	const dispatch = useAppDispatch();
	const sidebarCanvas = useRef(new SidebarCanvas());

	const openPost = (title: string) => {
		dispatch(toggleSidebar());
		navigate(`?name=${title}`);
	};

	useEffect(() => {
		const canvasInstance = sidebarCanvas.current;
		if (canvasRef.current) {
			canvasInstance.init(canvasRef.current);
		}

		return () => {
			console.log("Unsubscribing from canvas events");
			canvasInstance.stop();
		};
	}, []);

	useEffect(() => {
		const canvasInstance = sidebarCanvas.current;
		if (sidebar_Status) {
			canvasInstance.start();
		} else {
			canvasInstance.stop();
		}
	}, [sidebar_Status]);

	return (
		<menu
			className={`${styles.wrapper} ${
				sidebar_Status ? styles.sidebarOpened : ""
			}`}
		>
			<canvas ref={canvasRef} className={styles.canvas} />
			<SidebarHead />
			<section className={styles.content}>
				<ul>
					{pages.map((page) => (
						<li
							key={page.src}
							onClick={() => openPost(`${page.src}`)}
						>
							{page.title}
						</li>
					))}
				</ul>
			</section>
		</menu>
	);
};
