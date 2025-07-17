import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import { getMD } from "../api/patterns/patterns.api";
import styles from "../styles/learning.module.scss";
import { useLocation } from "react-router";
import { Seo } from "../../../shared/ui/helmet";
import { SidebarPosts } from "./sidebar-posts/sidebar-posts";
import { FaBars } from "react-icons/fa";
import { toggleSidebar } from "../model/store.learning";
import { useAppDispatch } from "../../../shared/hooks/redux.hook";

export const LearningPage = () => {
	const [markdownContent, setMarkdownContent] = useState<string>("");
	const location = useLocation();
	const searchParams = new URLSearchParams(location.search);
	const name =
		searchParams.get("name") ?? "posts/HOW_TO_REMEMBER_PATTERNS.md";
	const dispatch = useAppDispatch();

	useEffect(() => {
		fetchMD(name);
	}, [name]);

	async function fetchMD(name: string) {
		const md = await getMD(name);
		if (typeof md !== "string") {
			setMarkdownContent("Failed to fetch markdown content");
			return;
		}
		setMarkdownContent(md);
	}

	return (
		<section className={styles.wrapper}>
			<FaBars
				className={styles.iconBar}
				onClick={() => dispatch(toggleSidebar())}
			/>
			<Seo title="learning. Посты" description="learning. Посты " />
			<SidebarPosts />
			<section className={styles.content}>
				<Markdown>{markdownContent}</Markdown>
			</section>
		</section>
	);
};
