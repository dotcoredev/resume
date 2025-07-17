export class Figure {
	x: number;
	y: number;
	canvasWidth: number;
	canvasHeight: number;
	radius: number;
	speed: number;
	size: number = 250;

	constructor(width: number, height: number) {
		this.canvasWidth = width;
		this.canvasHeight = height;
		this.x = Math.random() * this.canvasWidth;
		this.y = Math.random() * this.canvasHeight;
		this.radius = Math.random() * this.size; // Random radius between 10 and 30
		this.speed = Math.random() * 0.27; // Random speed between 0.35 and 1.35
	}

	draw(ctx: CanvasRenderingContext2D) {
		ctx.beginPath();

		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
		ctx.fill();
	}

	update() {
		this.x += this.speed * 0.04;
		this.y += this.speed;

		if (this.y > this.canvasHeight + this.size) {
			this.y = -this.size; // Reset y to the top
			this.x = Math.random() * this.canvasWidth; // Reset x to a random position
		}
	}
}
