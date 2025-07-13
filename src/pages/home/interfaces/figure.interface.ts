export interface IFigure {
	width?: number;
	height?: number;
	x?: number;
	y?: number;
	radius?: number;
	draw: (ctx: CanvasRenderingContext2D) => IFigure;
	update?: () => void;
}

export type TFigureParams = {
	width?: number;
	height?: number;
	x?: number;
	y?: number;
	radius?: number;
};

export type TFigure = new (params: TFigureParams) => IFigure;
