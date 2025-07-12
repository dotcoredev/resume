export interface IFigure {
	width?: number;
	height?: number;
	x?: number;
	y?: number;
	radius?: number;
	draw: (ctx: CanvasRenderingContext2D) => void;
	params: (figureParams: TFigureParams) => IFigure;
}

export type TFigureParams = {
	width?: number;
	height?: number;
	x?: number;
	y?: number;
	radius?: number;
};
