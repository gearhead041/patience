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
			this.cards.push(...cards);
			this.div.appendChild(cards[0].div);
			// TODO validate king rule here? or in move
		}
		else {
			var topCard = this.cards[this.cards.length - 1];
			topCard.pushTop(cards[0]);
			this.cards.push(...cards);
		}

		this.cards.forEach((c, i) => { //refresh entire z index
			c.div.style.zIndex = (i).toString();
			c.div.style.left = ""; // Reset drag position to snap to parent/pillar
			c.div.style.right = "";
			if (i > 0) {
				const prev = this.cards[i - 1];
				// In a nested structure, top is relative to the card above it
				c.div.style.top = prev.isFaceup ? "30px" : "10px";
			} else {
				c.div.style.top = "0px";
			}
		});



		return;
	}

	public pop(index: number): Card[] | null {
		var cardPopped: Card | null;
		if (index === 0) {
			cardPopped = this.cards![0];
			this.div.removeChild(cardPopped.div);
		}
		else {
			var cardBelow = this.cards![index - 1]; //target lower card
			if(!cardBelow.isFaceup) {

				cardBelow.flip();
			}
			cardPopped = cardBelow.popTop();
		}
		var cardsPopped = this.cards?.splice(index) ?? null;
		return cardsPopped;
	}
}
