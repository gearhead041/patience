import { Stack, Suit } from "./models";

export class Card extends Stack {
	public value: number;
	public suit: Suit;
	public isFaceup: boolean;
	public declare onTop: Card;
	private div!: HTMLDivElement;

	constructor(value: number, suit: Suit) {
		super();
		this.value = value;
		this.suit = suit;
		this.isFaceup = false;
		this.draw();
	}

	public override popTop(): Card | null {
		return super.popTop() as Card;
	}

	public flip() {
		if (this.isFaceup)
		{
			this.div.classList.replace("faceup", "facedown");
		}
		else {
			this.div.classList.replace("facedown", "faceup");
		}
		this.isFaceup = !this.isFaceup;
	}

	private draw() {
		var div = document.createElement("div");
		div.className = "card";
		document.body.appendChild(div);
		div.classList.add("facedown");
		dragAndDrop(div);
		this.div = div;
	}

	public override pushTop(card: Card) {
		if (Math.abs(this.value - card.value) === 1) {
			this.onTop = card;
			return;
		}
		throw new Error("Sequential numbers only");
	}

	public toString() {
		return this.value + " of " + this.suit.toString();
	}
}

function dragAndDrop(div: HTMLDivElement) {
	var isDown = false;
	var offset = [0, 0];
	var mousePosition;

	div.addEventListener(
		"mousedown",
		function (e) {
			isDown = true;
			offset = [div.offsetLeft - e.clientX, div.offsetTop - e.clientY];
		},
		true
	);

	document.addEventListener(
		"mouseup",
		function () {
			isDown = false;
		},
		true
	);

	document.addEventListener(
		"mousemove",
		function (event) {
			event.preventDefault();
			if (isDown) {
				mousePosition = {
					x: event.clientX,
					y: event.clientY,
				};
				div.style.left = mousePosition.x + offset[0] + "px";
				div.style.top = mousePosition.y + offset[1] + "px";
			}
		},
		true
	);
}
