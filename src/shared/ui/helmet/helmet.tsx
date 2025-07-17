import { Helmet } from "react-helmet-async";
import type { FC } from "react";

const DEFAULT_TITLE = "Резюме разработчика";
const DEFAULT_DESCRIPTION =
	"Резюме разработчика. JavaScript/Typescript, React, Nodejs. Посмотрите мои проекты и достижения.";
const SITE_URL = "https://dotcore.dev";

interface SeoProps {
	title?: string;
	description?: string;
}

export const Seo: FC<SeoProps> = ({ title, description }) => {
	const finalTitle = title ? `${title}` : DEFAULT_TITLE;
	const finalDescription = description || DEFAULT_DESCRIPTION;

	return (
		<Helmet>
			{/* Основные мета-теги */}
			<title>{finalTitle}</title>
			<meta name="description" content={finalDescription} />

			{/* Open Graph теги для Facebook, VK, и т.д. */}
			<meta property="og:title" content={finalTitle} />
			<meta property="og:description" content={finalDescription} />
			<meta
				property="og:url"
				content={SITE_URL + window.location.pathname}
			/>
			<meta property="og:site_name" content={DEFAULT_TITLE} />
		</Helmet>
	);
};
