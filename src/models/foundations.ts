import type { Card } from "./card";
import { Pillar } from "./pillar";

export 	class SuitStack extends Pillar {

	constructor() {
		super();
	}

	public override offsetCards(): void {
		this.cards.forEach((c,i) => {
			c.div.style.top = "0";
			c.div.style.left = "0";
			c.div.style.zIndex = i.toString();
		})
	}
}

export class Foundation {
	public foundations: SuitStack[] = [];
	public div!: HTMLDivElement;

	constructor(num: number) {
		for (let i = 0; i < num; i++) {
			this.foundations.push(new SuitStack())
		}
		this.draw();
	}
	private draw() {
		this.div = document.createElement("div");
		this.div.classList.add("foundation");
		this.foundations.forEach((x) => this.div.appendChild(x.div));
	}
}
