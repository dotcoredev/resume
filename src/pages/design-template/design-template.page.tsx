import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import { getMD } from "./api/patterns/patterns.api";
import styles from "./styles/page.module.scss";
import { useLocation } from "react-router";

export const DesignTemplatePage = () => {
	const [markdownContent, setMarkdownContent] = useState<string>("");
	const location = useLocation();
	const searchParams = new URLSearchParams(location.search);
	const name = searchParams.get("name") ?? "HOW_TO_REMEMBER_PATTERNS.md";

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
			<section className={styles.content}>
				<Markdown>{markdownContent}</Markdown>
			</section>
		</section>
	);
};
