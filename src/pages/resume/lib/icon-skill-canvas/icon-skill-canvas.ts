export class IconSkillCanvas {
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D | null;
	private width: number;
	private height: number;
	private image: HTMLImageElement = new Image();

	constructor(
		canvas: HTMLCanvasElement,
		width: number,
		height: number,
		iconSrc: string
	) {
		this.canvas = canvas;
		this.ctx = this.canvas.getContext("2d");
		this.width = width;
		this.height = height;
		this.canvas.width = this.width;
		this.canvas.height = this.height;
		this.image.src = iconSrc;
	}

	draw() {
		if (!this.ctx) {
			console.log("ctx is null");
			return;
		}

		const padding = 10;
		const size =
			Math.min(this.canvas.width, this.canvas.height) - padding * 2;
		const x = (this.canvas.width - size) / 2;
		const y = (this.canvas.height - size) / 2;

		this.ctx.drawImage(this.image, x, y, size, size);

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

	update() {
		this.ctx!.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.draw();
		requestAnimationFrame(() => this.update());
	}

	start() {
		this.image.onload = () => {
			this.update();
		};
	}
}
