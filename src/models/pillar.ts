import type { Card } from "./card";

//
// ontop here refers to the card at the top of this pillar
//
export class Pillar {
	public cards: Card[] = [];
	public div: HTMLDivElement = document.createElement("div");
	constructor() {
		this.div.className = "pillar";
	}
	public push(card: Card[]) {
		if (this.cards.length === 0) {
			this.cards.push(...card);
		}
		else {
			var topCard = this.cards[this.cards.length - 1];
			topCard.pushTop(card[0]);
			this.cards.push(...card);
		}
		card.forEach((c, i) => {
			c.div.style.zIndex = (this.cards.length - card.length + i).toString();
		});
		this.div.append(...card.map((x) => x.div));
		return;

	}

	public pop(index: number): Card[] | null {
		var cardPopped: Card | null;
		if (index === 0) {
			cardPopped = this.cards![0];
		}
		else {

			var cardBelow = this.cards![index - 1]; //target lower card
			cardBelow.flip();
			cardPopped = cardBelow?.popTop();
		}
		//remove all lower cards from array
		var cardsPopped = this.cards?.splice(index) ?? null;
		for (let i = 0; i < cardsPopped.length; i++) { // remove divs from view
			cardsPopped[i].div.remove();
		}
		return cardsPopped;
	}
}
