import type { Card } from "./card";
import { Pillar } from "./Pillar";

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

class Board {
	public pillars: ReadonlyArray<Pillar>;
	public div: HTMLDivElement = document.createElement("div");
	constructor(numLanes: number = 7) {
		this.pillars = new Array(numLanes).fill(null).map(() => new Pillar());
		this.div.append(...this.pillars.map((x) => x.div));
		this.div.className = "board";
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
