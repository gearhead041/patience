import { makeMove } from "../engine";
import type { MarketPillar } from "./Market";
import { Stack, Suit } from "./models";
import type { Pillar } from "./pillar";

export class Card extends Stack {
	public value: number;
	public suit: Suit;
	public isFaceup: boolean;
	public declare onTop: Card | null; 
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
		var result = this.onTop;
		this.onTop = null;
		return result;
	}

	public flip() {
		if (this.isFaceup)
		{
			this.div.classList.replace("faceup", "facedown");
			this.div.textContent = "";
		}
		else {
			this.div.classList.replace("facedown", "faceup");
			this.div.textContent = this.value.toString();
		}
		this.isFaceup = !this.isFaceup;
	}

	private draw() {
		var div = document.createElement("div");
		div.className = "card";
		div.classList.add(this.suit.shape);
		div.classList.add("facedown");
		this.div = div;
	}

	public override pushTop(card: Card) {
		this.onTop = card;
		this.div.appendChild(card.div);
	}

	public toString() {
		return this.value + " of " + this.suit.toString();
	}
}

function dragAndDrop(card: Card) {
	var div = card.div;
	var offset = [0, 0];
	var destPillar: Element | null;
	var srcPillar:  Pillar | MarketPillar;
	var zIndex: string;
	var position = {
		left:"",
		top:""
	}
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
		console.log(elemBelow);
		if (elemBelow) {
			if(elemBelow.closest('.market'))
			{
				return null;
			}
			const pillarDiv = elemBelow.closest('.pillar');
			return pillarDiv;
		}
		return null;
	}

	const onMouseUp = (event: MouseEvent) => {
		event.preventDefault();
		var srcPillar = div.closest(".pillar");
		destPillar = getLowerPillarElem(event);
		div.style.zIndex = zIndex;
		var moved = false;

		if (destPillar && srcPillar !== destPillar) {
			const dest = (destPillar as any).pillar as Pillar;
			const src = (srcPillar as any).pillar as Pillar;
			var result = makeMove({
				source: src,
				destination: dest,
				index: parseInt(div.style.zIndex),
			})
			moved = result > 0;
		}

		if(!moved) {
			if(div.closest(".market")) //reset differently when src is market pillar
			{
				div.style.left = "10px";
				div.style.top = "0";
			}
			else {
				//reset position here here if no movement is made
				div.style.left= "";
				div.style.top = "10px";
			}
		}

		document.removeEventListener("mousemove", onMouseMove);
		document.removeEventListener("mouseup", onMouseUp);
	};

	div.addEventListener(
		"mousedown",
		function (e) {
			if(!card.isFaceup)
			{
				return;
			}
			e.preventDefault();
			e.stopPropagation();
			//save initial state
			zIndex = card.div.style.zIndex;
			position.left = div.style.left;
			position.top = div.style.top;
			offset = [div.offsetLeft - e.clientX, div.offsetTop - e.clientY];
			div.style.zIndex = "1000"; //make sure it's on top while dragging
			document.addEventListener("mousemove", onMouseMove);
			document.addEventListener("mouseup", onMouseUp);
		},
	);
}
