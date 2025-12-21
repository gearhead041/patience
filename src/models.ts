import type { Card } from "./card";

export class Stack {
	public onTop: Stack | null = null;

	public popTop() {
		var removed = this.onTop;
		this.onTop = null;
		return removed ?? null;
	}

	public pushTop(top: Stack) {
		this.onTop = top;
	}
}

class Suit {
	public color: string;
	public shape: string;

	constructor(color: string, shape: string) {
		this.color = color;
		this.shape = shape;
	}

	public toString() {
		return this.shape;
	}
}

//
// ontop here refers to the card at the top of this pillar
//
class Pillar {
	public cards: Card[] | null = null;

	public push(card: Card[]) {

		if (this.cards)
		{
			var topCard = this.cards![-1];
			topCard.pushTop(card[0]);
			this.cards.push(...card);
			return;
		}


	}

	public pop(index: number): Card[] | null {
		var cardPopped: Card | null;
		if (index === 0) {
			cardPopped = this.cards![0];
		}
		else {
			
			var cardBelow = this.cards![index - 1]; //target lower card
			cardBelow.flip();
			cardPopped = cardBelow?.popTop()
		}
		//remove all lower cards from array
		var cardsPopped = this.cards?.splice(index) ?? null;
		return cardsPopped;
	}
}

class Board {
	public pillars: ReadonlyArray<Pillar>;
	constructor(numLanes: number = 7) {
		this.pillars = new Array(numLanes).fill(null).map(() => new Pillar());
	}
}

class SuitStack extends Stack {
	public suit: Suit;
	public topCard: Card | null = null;

	constructor(suit: Suit) {
		super();
		this.suit = suit;
	}
	public override pushTop(top: Card): void {
		if (top.suit !== this.suit) {
			throw Error("Wrong suit on suit stack");
		}
		if (this.topCard) {
			this.topCard.pushTop(top);
		}
		this.topCard = top;
	}
}

class Foundation {
	public foundations: ReadonlyArray<SuitStack>;

	constructor(suits: Suit[]) {
		this.foundations = suits.map((x) => new SuitStack(x));
	}
}

class Market {
	public cards: Card[];

	constructor(cards: Card[]) {
		this.cards = cards;
	}


	public shuffle() {
		for (let i = this.cards.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
		}
	}

	public pop(): Card | undefined {
		return this.cards.pop();
	}
}

export interface move {
	source: Pillar; // pillar being moved from 
	destination: Pillar; // pillar being moved to
	index: number; // index of card being moved (in source)
}

export { Board, Suit, Foundation, Market };
