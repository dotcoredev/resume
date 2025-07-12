import { useSearchParams } from "react-router";
import i18n from "../libs/i18n";
import { useEffect } from "react";

export const useI18n = () => {
	const [searchParams] = useSearchParams();

	useEffect(() => {
		const lang = searchParams.get("language") || "ru";
		i18n.changeLanguage(lang);
	}, [searchParams]);

	return i18n;
};
