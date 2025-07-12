import type { IFigure, TFigureParams } from "../../interfaces/figure.interface";

export class Circle implements IFigure {
	x!: number;
	y!: number;
	radius!: number;
	ctx!: CanvasRenderingContext2D;

	constructor() {
		this.x = Math.random() * window.innerWidth;
		this.y = Math.random() * window.innerHeight;
		this.radius = Math.random() * 40;
	}

	params({
		width = window.innerWidth,
		height = window.innerHeight,
		radius = 20,
	}: TFigureParams) {
		this.x = Math.random() * width;
		this.y = Math.random() * height;
		this.radius = radius;
		return this;
	}

	draw(ctx: CanvasRenderingContext2D) {
		ctx.beginPath();
		ctx.fillStyle = "orange";
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
		ctx.fill();
	}
}
