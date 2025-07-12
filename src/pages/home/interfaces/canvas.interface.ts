export interface ICanvas {
	canvas: HTMLCanvasElement | undefined;
	ctx: CanvasRenderingContext2D | null;
	width: number;
	height: number;
	addElement: (canvasElement: HTMLCanvasElement) => void;
	init: (canvasElement: HTMLCanvasElement) => void;
	subscribeEvents: () => void;
	unsubscribeEvents: () => void;
}
