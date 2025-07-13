import type { IFigure, TFigure } from "../../interfaces/figure.interface";

export class Draw {
	ctx!: CanvasRenderingContext2D | null;
	canvas!: HTMLCanvasElement;
	figure!: TFigure;
	figures!: IFigure[];

	constructor(
		ctx: CanvasRenderingContext2D,
		canvas: HTMLCanvasElement,
		figure: TFigure
	) {
		this.ctx = ctx;
		this.figure = figure;
		this.canvas = canvas;
		this.figures = [];
	}

	createFigures(count: number = 1) {
		if (this.ctx) {
			if (count === 1) {
				this.figures.push(
					new this.figure({
						width: this.canvas.width,
						height: this.canvas.height,
						radius: 45,
					})
				);
				return this;
			}

			for (let i = 0; i <= count; i++) {
				this.figures.push(
					new this.figure({
						width: this.canvas.width,
						height: this.canvas.height,
						radius: 575,
					})
				);
			}
			return this;
		}
	}

	draw() {
		this.ctx?.clearRect(0, 0, this.canvas.width, this.canvas.height);

		this.figures.forEach((figure) => {
			figure.draw(this.ctx!);
			if ("update" in figure && typeof figure.update === "function") {
				figure.update();
			}
		});

		requestAnimationFrame(() => this.draw());
	}
}
