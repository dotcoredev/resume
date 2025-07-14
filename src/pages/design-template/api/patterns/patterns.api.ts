export async function getMD(name: string): Promise<string> {
	return new Promise((resolve) => {
		fetch(name)
			.then((response) => response.text())
			.then((text) => resolve(text));
	});
}
