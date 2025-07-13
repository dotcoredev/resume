export async function getPatternsMD() {
	return new Promise((resolve) => {
		fetch("/src/shared/assets/HOW_TO_REMEMBER_PATTERNS.md")
			.then((response) => response.text())
			.then((text) => resolve(text));
	});
}
