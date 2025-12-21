import { makeMove } from "../engine";
import { Stack, Suit } from "./models";
import type { Pillar } from "./Pillar";

export class Card extends Stack {
	public value: number;
	public suit: Suit;
	public isFaceup: boolean;
	public declare onTop: Card;
	public div!: HTMLDivElement;

	constructor(value: number, suit: Suit) {
		super();
		this.value = value;
		this.suit = suit;
		this.isFaceup = false;
		this.draw();
		dragAndDrop(this);
	}

	public override popTop(): Card | null {
		var lastChild = this.div.lastChild;
		if (lastChild)
			this.div.removeChild(lastChild);
		return this.onTop;
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

	public draw() {
		var div = document.createElement("div");
		div.className = "card";
		div.classList.add(this.suit.shape);
		div.classList.add("facedown");
		div.draggable = true;
		this.div = div;
		// dragAndDrop(this);
	}

	public override pushTop(card: Card) {
		this.onTop = card;
		this.div.appendChild(card.div);
	}

	public toString() {
		return this.value + " of " + this.suit.toString();
	}
}

export function dragAndDrop(card: Card) {
	var div = card.div;
	var offset = [0, 0];
	var destPillar: Element | null;
	var zIndex: string;

	const onMouseMove = (event: MouseEvent) => {
		event.preventDefault();
		const mousePosition = {
			x: event.clientX,
			y: event.clientY,
		};
		div.style.left = mousePosition.x + offset[0] + "px";
		div.style.top = mousePosition.y + offset[1] + "px";
	};

	function getLowerPillarElem(event: MouseEvent) : Element | null{
		div.hidden = true;
		const elemBelow = document.elementFromPoint(event.clientX, event.clientY);
		div.hidden = false;
		
		if (elemBelow) {
			const pillarDiv = elemBelow.closest('.pillar');
			return pillarDiv;
		}
		return null;
	}

	const onMouseUp = (event: MouseEvent) => {
		// Check what is underneath the mouse
		event.preventDefault();
		destPillar = getLowerPillarElem(event);
		div.style.zIndex = zIndex;
		var srcPillar = div.closest(".pillar");
		if (destPillar && srcPillar !== destPillar) {
			// console.log('reached lower pillar');
			const dest = (destPillar as any).pillar as Pillar;
			const src = (srcPillar as any).pillar as Pillar;
			makeMove({
				source: src,
				destination: dest,
				index: parseInt(div.style.zIndex),
			})
		}
		else {
			//reset position here here if no pillar is hovered over
			div.style.top = "";
			div.style.left = "";
		}
		document.removeEventListener("mousemove", onMouseMove);
		document.removeEventListener("mouseup", onMouseUp);
	};

	div.addEventListener(
		"mousedown",
		function (e) {
			e.preventDefault();
			e.stopPropagation();
			zIndex = card.div.style.zIndex;
			offset = [div.offsetLeft - e.clientX, div.offsetTop - e.clientY];
			div.style.zIndex = "200";
			document.addEventListener("mousemove", onMouseMove);
			document.addEventListener("mouseup", onMouseUp);
		},
	);
}
