import { Pillar } from "./pillar";


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



export interface move {
	source: Pillar; // pillar being moved from 
	destination: Pillar; // pillar being moved to
	index: number; // index of card being moved (in source)
}

export { Board, Suit };
