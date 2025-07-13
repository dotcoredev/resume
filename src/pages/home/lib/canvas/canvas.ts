import type { ICanvas } from "../../interfaces/canvas.interface";
import { Circle } from "./circle";
import { Draw } from "./draw";

export class Canvas implements ICanvas {
	canvas: HTMLCanvasElement | undefined;
	ctx!: CanvasRenderingContext2D | null;
	width: number;
	height: number;
	countFigures: number;

	constructor() {
		this.width = window.innerWidth;
		this.height = window.innerHeight;
		this.countFigures = 20;
	}

	init(canvasElement: HTMLCanvasElement) {
		this.addElement(canvasElement);
		this.subscribeEvents();
		return this;
	}

	run() {
		if (this.ctx && this.canvas) {
			new Draw(this.ctx, this.canvas, Circle)
				.createFigures(this.countFigures)
				?.draw();
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
		if (!this.canvas || !this.ctx) return;
		this.canvas.width = this.width = window.innerWidth;
		this.canvas.height = this.height = window.innerHeight;

		if (this.ctx && this.canvas) {
			new Draw(this.ctx, this.canvas, Circle)
				.createFigures(this.countFigures)
				?.draw();
		}
	}
}
