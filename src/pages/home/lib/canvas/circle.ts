import type { IFigure, TFigureParams } from "../../interfaces/figure.interface";

export class Circle implements IFigure {
	x!: number;
	y!: number;
	radius!: number;
	angle!: number;
	speed!: number;
	animX!: number;
	animY!: number;
	firstColor!: string;
	secondColor!: string;
	gradient!: CanvasGradient | null;

	constructor({
		width = window.innerWidth,
		height = window.innerHeight,
		radius = 20,
	}: TFigureParams) {
		this.x = Math.random() * width;
		this.y = Math.random() * height;
		this.radius = Math.random() * radius + 400;
		this.angle = Math.random() * Math.PI * 20;
		this.speed = Math.random() * 0.0029;

		this.animX = 0;
		this.animY = 0;

		this.firstColor = `hsla(${Math.random() * 190}, 60%, 50%, 1)`;
		this.secondColor = `hsla(${Math.random() * 5}, 40%, 50%, 0)`;
		this.gradient = null;
	}

	update() {
		this.angle += this.speed;
		this.animX = this.x + Math.cos(this.angle) * 600;
		this.animY = this.y + Math.sin(this.angle) * 500;
	}

	draw(ctx: CanvasRenderingContext2D) {
		this.gradient = ctx?.createRadialGradient(
			this.animX,
			this.animY,
			0,
			this.animX,
			this.animY,
			this.radius
		);
		this.gradient?.addColorStop(0, this.firstColor);
		this.gradient?.addColorStop(1, this.secondColor);

		ctx.imageSmoothingQuality = "high";
		ctx.globalCompositeOperation = "overlay"; // или "overlay", "multiply"

		ctx.beginPath();
		ctx.fillStyle = this.gradient!;
		ctx.arc(this.animX, this.animY, this.radius, 0, Math.PI * 2);
		ctx.fill();
		return this;
	}
}
