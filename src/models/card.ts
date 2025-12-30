import { MARKET_OFFSET, PILLAR_FACEDOWN_OFFSET, PILLAR_FACEUP_OFFSET } from "../constants";
import { makeMove } from "../engine";
import { Stack, Suit } from "./models";
import type { Pillar } from "./pillar";

export class Card extends Stack {
	public value: number;
	public suit: Suit;
	public isFaceup: boolean;
	public declare onTop: Card | null; 
	public div!: HTMLDivElement;
	private textNode!: HTMLDivElement;

	constructor(value: number, suit: Suit) {
		super();
		this.value = value;
		this.suit = suit;
		this.isFaceup = false;
		this.draw();
		dragAndDrop(this);
	}

	public override popTop(): Card | null {
		var childCard = this.div.querySelector(".card");
		if (childCard) {
			console.log('lastChild',childCard);
			this.div.removeChild(childCard);
		}
		var result = this.onTop;
		this.onTop = null;
		return result;
	}

	public flip() {
		if (this.isFaceup)
		{
			this.div.classList.replace("faceup", "facedown");
			this.textNode.remove();
		}
		else {
			this.div.classList.replace("facedown", "faceup");
			this.textNode = document.createElement("div");
			this.textNode.classList.add("card-face");
			this.textNode.textContent = this.value.toString();
			this.div.appendChild(this.textNode);
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
		console.log('dest pillar',destPillar);
		
		div.style.zIndex = zIndex;
		var moved = false;

		if (destPillar && srcPillar !== destPillar) {
			const dest = (destPillar as any).pillar as Pillar;
			console.log('dest obj',dest);
			
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
				div.style.left =  MARKET_OFFSET; 
				//reset differently for cards that begin a slice on the right pillar
				if(div.parentElement?.classList.contains("right"))
				{
					div.style.left = "0";
				}
				div.style.top = "0";
			}
			else {
				//reset position here here if no movement is made
				div.style.left= "0";
				div.style.top = card.isFaceup ? PILLAR_FACEUP_OFFSET : PILLAR_FACEDOWN_OFFSET;
				if(div.parentElement?.classList.contains("pillar") //first card on the pillar
				 || div.closest(".foundation")) // or is from the foundation
				{
					div.style.top = "0";
				}
			}
		}

		document.removeEventListener("mousemove", onMouseMove);
		document.removeEventListener("mouseup", onMouseUp);
	};

	div.addEventListener(
		"mousedown",
		function (e) {
			if(!card.isFaceup 
				|| (div.closest(".market") 
				&& card.onTop)) //don't move if it's facedown or if it's in the market and not ontop
			{
				return;
			}
			console.log(div.parentElement)
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
