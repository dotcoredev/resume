import type { ICanvas } from "../../interfaces/canvas.interface";

class IconSkillCanvas implements ICanvas {
	private canvas!: HTMLCanvasElement;
	private ctx!: CanvasRenderingContext2D | null;
	private width!: number;
	private height!: number;
	private image: HTMLImageElement = new Image();
	private animationID: number | null = null;
	private baseCtx: CanvasRenderingContext2D | null = null;
	private baseCanvas: HTMLCanvasElement | null = null;

	init(
		canvas: HTMLCanvasElement,
		width: number,
		height: number,
		iconSrc: string
	) {
		this.canvas = canvas;
		this.ctx = this.canvas.getContext("2d", { willReadFrequently: true });
		this.width = width;
		this.height = height;
		this.canvas.width = this.width;
		this.canvas.height = this.height;
		this.image.src = iconSrc;

		this.baseCanvas = document.createElement("canvas");
		this.baseCanvas.width = this.width;
		this.baseCanvas.height = this.height;
		this.baseCtx = this.baseCanvas.getContext("2d", {
			willReadFrequently: true,
		});

		return this;
	}

	private drawBaseImage() {
		if (!this.baseCtx) return;

		const padding = 10;
		const size = Math.min(this.width, this.height) - padding * 2;
		const x = (this.width - size) / 2;
		const y = (this.height - size) / 2;

		this.baseCtx.clearRect(0, 0, this.width, this.height);
		this.baseCtx.drawImage(this.image, x, y, size, size);
	}

	private draw() {
		if (!this.ctx || !this.baseCtx || !this.baseCanvas) {
			console.log("ctx is null");
			return;
		}

		this.ctx.drawImage(this.baseCanvas, 0, 0);

		// Получаем данные изображения
		const imageData = this.ctx.getImageData(
			0,
			0,
			this.canvas.width,
			this.canvas.height
		);
		const data = imageData.data;

		// 1. Случайные цветовые сдвиги
		for (let i = 0; i < data.length; i += 4) {
			if (Math.random() < 0.7) {
				const shift = Math.floor(Math.random() * 8) - 4; // Сдвиг от -4 до +4
				const sourceIndex = i + shift * 4;

				// ✅ Проверяем границы массива
				if (sourceIndex >= 0 && sourceIndex < data.length - 3) {
					//data[i] = data[sourceIndex] * 0.3; // Красный
					data[i + 1] = Math.min(255, data[sourceIndex + 1] + 110); // Зеленый
					//data[i + 2] = data[sourceIndex + 2] * 0.4; // Синий
				}
			}
		}

		this.ctx.putImageData(imageData, 0, 0);
	}

	private update() {
		this.ctx!.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.draw();
		this.animationID = requestAnimationFrame(() => this.update());
	}

	start() {
		this.image.onload = () => {
			this.drawBaseImage();
			this.update();
		};
	}

	stop() {
		if (this.ctx) {
			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		}

		if (this.animationID) {
			cancelAnimationFrame(this.animationID);
			this.animationID = null;
		}

		if (this.baseCtx) {
			this.baseCtx.clearRect(0, 0, this.width, this.height);
		}
	}
}

export { IconSkillCanvas };
