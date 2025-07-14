export function exponentialJitter(
	attempt: number,
	baseDelay: number = 1000,
	maxDelay: number = 30000,
	jitterRange: number = 1000
): number {
	const exponentialDelay = Math.min(
		baseDelay * Math.pow(2, attempt - 1),
		maxDelay
	); // вычисляем экспоненциальную задержку с учетом максимальной задержки
	const jitter = generateJitter(jitterRange); // генерируем случайный джиттер в заданном диапазоне
	return exponentialDelay + jitter;
}

export function generateJitter(maxJitter: number = 1000): number {
	return Math.random() * maxJitter; // генерируем случайное значение джиттера
}
