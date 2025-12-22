import { makeMove } from "../engine";
import type { Card } from "./card";
import { Pillar } from "./pillar";

export class Market {
	public cards: Card[];
	public div!: HTMLDivElement;
	public left!: MarketPillar;
	public right!: MarketPillar;

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

	public draw() {
		this.div = document.createElement("div");
		this.left = new MarketPillar();
		this.right = new MarketPillar();
		this.div.classList.add("market");
		this.left.div.classList.add("left");
		this.right.div.classList.add("right");

		this.div.appendChild(this.left.div);
		this.div.appendChild(this.right.div);
		this.left.push(this.cards);
		popAndPushMarket(this);		
	}
}

export class MarketPillar extends Pillar {
	constructor() {
		super();
		this.div.classList.add();
	}
	//TODO fix child containing parent issue
	public override offsetCards() {
		this.cards.forEach((c, i) => { //refresh entire z index
			c.div.style.zIndex = (i).toString();
			// c.div.style.left = ""; // Reset drag position to snap to parent
			c.div.style.right = "";
			if (i > 0 && this.div.classList.contains("right")) {
				const prev = this.cards[i - 1];
				
				c.div.style.left = prev.isFaceup ? "10px" : "5px";
				c.div.style.top = "0";
			}
		});
	}

	public override pop(index: number): Card[] | null {
		var cardPopped: Card | null;
		if (index === 0) {
			cardPopped = this.cards![0];
			this.div.removeChild(cardPopped.div);
		}
		else {
			var cardBelow = this.cards![index - 1]; //target lower card
			cardPopped = cardBelow.popTop();
			console.log('top pop market pillar',cardPopped)

		}
		var cardsPopped = this.cards?.splice(index) ?? null;
		cardsPopped.forEach((x) =>{
			if(!x.isFaceup) x.flip()
		} );
		return cardsPopped;
	}
}

function popAndPushMarket(market: Market) {
	var left = market.left;
	var right = market.right;

	left.div.addEventListener("click", (e) => {
		console.log('clicked left');
		e.preventDefault();
		e.stopPropagation();
		makeMove(
			{
				source:left,
				destination:right,
				index:left.cards.length-1
			}
		);
	});
}