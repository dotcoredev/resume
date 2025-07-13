import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import { getPatternsMD } from "./api/patterns/patterns.api";
import styles from "./styles/page.module.scss";

export const DesignTemplatePage = () => {
	const [markdownContent, setMarkdownContent] = useState<string>("");

	useEffect(() => {
		fetchMD();
	}, []);

	async function fetchMD() {
		const md = await getPatternsMD();
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
