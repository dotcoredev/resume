import { Figure } from "./figure";

export class SidebarCanvas {
	private canvas!: HTMLCanvasElement;
	private height!: number;
	private width!: number;
	private ctx!: CanvasRenderingContext2D;
	private animationFrameId?: number;
	private rects: Figure[] = [];
	private countFigures: number = 15;

	init(canvas: HTMLCanvasElement): SidebarCanvas {
		this.canvas = canvas;
		this.canvas.style.pointerEvents = "none";
		this.ctx = this.canvas.getContext("2d")!;

		this.resize();
		this.generateFigures();

		return this;
	}

	private resize() {
		// Синхронизируем размеры
		this.canvas.width = 500;
		this.canvas.height = window.innerHeight;

		// Сохраняем для логики рисования
		this.width = this.canvas.width;
		this.height = this.canvas.height;

		console.log(`Canvas resized to: ${this.width}x${this.height}`);
	}

	start() {
		console.log("start");
		this.update();
	}

	generateFigures() {
		for (let i = 0; i < this.countFigures; i++) {
			const figure = new Figure(this.width, this.height);
			this.rects.push(figure);
		}
	}

	update() {
		this.draw();
		this.animationFrameId = requestAnimationFrame(() => this.update());
	}

	draw() {
		if (!this.ctx) return;
		this.ctx.clearRect(0, 0, this.width, this.height);

		this.ctx.fillStyle = "rgba(255, 255, 255, 0.1)"; // Light background for visibility

		this.rects.forEach((rect) => {
			rect.update();
			rect.draw(this.ctx);
		});
	}

	stop() {
		console.log("stop");
		if (this.animationFrameId) {
			cancelAnimationFrame(this.animationFrameId);
			this.animationFrameId = undefined;
		}
	}
}
