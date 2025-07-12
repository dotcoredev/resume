import type { ICanvas } from "../../interfaces/canvas.interface";
import { Circle } from "./circle";
import { Draw } from "./draw";

export class Canvas implements ICanvas {
	canvas: HTMLCanvasElement | undefined;
	ctx!: CanvasRenderingContext2D | null;
	width: number;
	height: number;

	constructor() {
		this.width = window.innerWidth;
		this.height = window.innerHeight;
	}

	init(canvasElement: HTMLCanvasElement) {
		this.addElement(canvasElement);
		this.subscribeEvents();
		return this;
	}

	run() {
		if (this.ctx && this.canvas) {
			new Draw(this.ctx, this.canvas, new Circle()).draw(111);
		}
	}

	addElement(canvasElement: HTMLCanvasElement) {
		this.canvas = canvasElement;
		this.canvas.width = this.width;
		this.canvas.height = this.height;
		this.ctx = canvasElement.getContext("2d");

		this.subscribeEvents();
	}

	subscribeEvents() {
		window.addEventListener("resize", this.handleResize.bind(this));
	}

	unsubscribeEvents() {
		window.removeEventListener("resize", this.handleResize.bind(this));
	}

	private handleResize() {
		this.width = window.innerWidth;
		this.height = window.innerHeight;
	}
}
