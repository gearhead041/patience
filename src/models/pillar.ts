import { PILLAR_FACEDOWN_OFFSET, PILLAR_FACEUP_OFFSET } from "../constants";
import { Card } from "./card";


//
export class Pillar {
	public cards: Card[] = [];
	public div: HTMLDivElement = document.createElement("div");

	constructor() {
		this.div.className = "pillar";
		(this.div as any).pillar = this;
	}

	public push(cards: Card[]) {
		if (this.cards.length === 0) { // if this is the first card we're adding here
			if(cards.length > 1) {
				for (let i = 0; i < cards.length-1; i++) {
					const card = cards[i];
					card.pushTop(cards[i+1]);
				}
			}
			this.cards.push(...cards);
			this.div.appendChild(cards[0].div);
		}
		else {
			var topCard = this.cards[this.cards.length - 1];
			topCard.pushTop(cards[0]);
			this.cards.push(...cards);
		}

		this.offsetCards();
		return;
	}

	public offsetCards()
	{
		this.cards.forEach((c, i) => { //refresh entire z index
			c.div.style.zIndex = (i).toString();
			c.div.style.left = ""; // Reset drag position to snap to parent/pillar
			c.div.style.right = "";
			if (i > 0) {
				const prev = this.cards[i - 1];
				// In a nested structure, top is relative to the card above it
				c.div.style.top = prev.isFaceup ? PILLAR_FACEUP_OFFSET : PILLAR_FACEDOWN_OFFSET;
			} else {
				c.div.style.top = "0px";
			}
		});
	}

	public pop(index: number): Card[] | null {
		var cardPopped: Card | null;
		if (index === 0) {
			cardPopped = this.cards![0];
			this.div.removeChild(cardPopped.div);
		}
		else {
			var cardBelow = this.cards![index - 1]; //target lower card
			cardPopped = cardBelow.popTop();
			if(!cardBelow.isFaceup) {
				cardBelow.flip();
			}
		}
		var cardsPopped = this.cards?.splice(index) ?? null;
		return cardsPopped;
	}
}
