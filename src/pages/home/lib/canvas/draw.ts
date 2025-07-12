import type { IFigure } from "../../interfaces/figure.interface";

export class Draw {
	ctx!: CanvasRenderingContext2D | null;
	canvas!: HTMLCanvasElement;
	figure!: IFigure;

	constructor(
		ctx: CanvasRenderingContext2D,
		canvas: HTMLCanvasElement,
		figure: IFigure
	) {
		this.ctx = ctx;
		this.figure = figure;
		this.canvas = canvas;
	}

	draw(count: number = 1) {
		if (this.ctx) {
			if (count === 1) {
				this.figure
					.params({
						width: this.canvas.width,
						height: this.canvas.height,
						radius: 45,
					})
					.draw(this.ctx);
				return;
			}

			for (let i = 0; i <= count; i++) {
				this.figure
					.params({
						width: this.canvas.width,
						height: this.canvas.height,
						radius: 45,
					})
					.draw(this.ctx);
			}
		}
	}
}
