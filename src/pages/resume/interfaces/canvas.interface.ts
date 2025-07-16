export interface ICanvas {
	init(
		canvas: HTMLCanvasElement,
		width: number,
		height: number,
		iconSrc: string
	): this;
	start(): void;
	stop(): void;
}
