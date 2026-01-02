import type { Entity, EntityName, Move } from "../components";
import {
	MARKET_FLIP_COUNT,
	MARKET_OFFSET,
	PILLAR_FACEDOWN_OFFSET,
	PILLAR_FACEUP_OFFSET,
} from "../settings";
import type { World } from "../world";
import type { IMovement } from "./interface/imovement";
import type { iRender } from "./interface/irender";
import { MovementService } from "./movement";

export class Animate implements iRender {
	sprites: WeakMap<HTMLDivElement, Entity> = new WeakMap<
		HTMLDivElement,
		Entity
	>();
	private readonly entityToSprites: Map<Entity, HTMLDivElement> = new Map<
		Entity,
		HTMLDivElement
	>();
	private readonly world: World;
	private readonly movementService: IMovement;

	constructor(world: World) {
		this.world = world;
		this.movementService = new MovementService(world);
	}

	createEntitySprite(entity: Entity, entityName: EntityName): HTMLDivElement {
		const div = document.createElement("div");
		switch (entityName) {
			case "Card":
				const cardData = this.world.cards.get(entity)!;
				div.className = "card";
				div.classList.add(cardData.suit.shape.toLowerCase());
				div.classList.add("facedown");
				this.addDragEventListener(div);
				break;
			case "Pile":
				div.classList.add("pillar");
				const pileType = this.world.pileType.get(entity)!.kind;
				div.classList.add(pileType);
				break;
			default:
				console.log("the hell?!");
				throw Error("unallowed type for sprite rendering");
		}
		this.sprites.set(div, entity);
		this.entityToSprites.set(entity, div);
		return div;
	}

	updatePileSprite(entity: Entity) {
		const pileDiv = this.entityToSprites.get(entity)!;
		const pileCards = this.world.pileCards.get(entity)!.cards;
		const cardDivs = pileCards.map((x) => this.entityToSprites.get(x)!);
		const pileType = this.world.pileType.get(entity)!.kind;
		if (!pileCards.length) return;
		switch (pileType) {
			case "waste":
				console.log("update waste pile");
				const stepBack = Math.min(cardDivs.length, MARKET_FLIP_COUNT);
				const addedArray = cardDivs.slice(-stepBack);
				addedArray.forEach((c, i) => {
					const card =
						pileCards[pileCards.length - addedArray.length + i];
					c.style.zIndex = (
						pileCards.length -
						addedArray.length +
						i
					).toString();
					if (i === 0) {
						c.style.left = "0";
					}
					if (i > 0) {
						c.style.left = MARKET_OFFSET;
					}
					c.style.top = "0";
					const cardData = this.world.cards.get(card)!;
					const isFaceup = this.world.faceUp.get(card)!.value;
					if (isFaceup && c.classList.contains("facedown")) {
						c.classList.replace("facedown", "faceup");
						const textNode = document.createElement("div");
						textNode.classList.add("card-face");
						textNode.textContent = cardData.rank.toString();
						c.appendChild(textNode);
					}
				});

				pileDiv.appendChild(
					cardDivs[cardDivs.length - stepBack]
				);
				addedArray.reduce((p, c) => p.appendChild(c));
				break;

			default:
				pileCards.forEach((c, i) => {
					const cardDiv = this.entityToSprites.get(c)!;
					const cardData = this.world.cards.get(c)!;
					cardDiv.style.zIndex = i.toString();
					cardDiv.style.left = ""; // Reset drag position to snap to parent/pillar
					cardDiv.style.right = "";
					cardDiv.style.top = "0";
					const isFaceup = this.world.faceUp.get(c)!.value;

					if (isFaceup && cardDiv.classList.contains("facedown")) {
						cardDiv.classList.replace("facedown", "faceup");
						const textNode = document.createElement("div");
						textNode.classList.add("card-face");
						textNode.textContent = cardData.rank.toString();
						cardDiv.appendChild(textNode);
					}

					if (!isFaceup && cardDiv.classList.contains("faceup")) {
						const cardFace = cardDiv.querySelector<HTMLDivElement>(".card-face");
						cardFace?.remove();
						cardDiv.classList.replace("faceup", "facedown");
					}

					if (pileType === "tableau") {
						if (i > 0) {
							cardDiv.style.top = isFaceup
								? PILLAR_FACEUP_OFFSET
								: PILLAR_FACEDOWN_OFFSET;
						} else {
							cardDiv.style.top = "0px";
						}
					}
				});
				pileDiv.appendChild(cardDivs[0]);
				cardDivs.reduce((prev, curr) => prev.appendChild(curr));
		}
	}

	private makeMove(
		srcCardDiv: HTMLDivElement,
		destPileDiv: HTMLDivElement | null
	): boolean {
		try {
			if (!destPileDiv) {
				console.log("no lower element found");
				return false;
			}
			const card = this.sprites.get(srcCardDiv)!;
			const destPile = this.sprites.get(destPileDiv)!;
			const srcPile = this.world.inPile.get(card)!.pile;
			const move: Move = {
				card: card,
				dest: destPile,
			};
			const result = this.movementService.moveCard(move);
			if (!result) {
				return false;
			}
			this.updatePileSprite(srcPile);
			this.updatePileSprite(destPile);
			return true;
		} catch (error) {
			console.log("error occured trying to move", error);
			return false;
		}
	}

	undo() {
		const undone = this.movementService.undo();
		console.log('undone result',undone);
		if (!undone) return;
		this.updatePileSprite(undone.src);
		this.updatePileSprite(undone.dest);
	}
	///add draggable event listener
	private addDragEventListener(div: HTMLDivElement) {
		let offset = [0, 0];
		let zIndex: string;
		let originalParent: HTMLDivElement;
		let originalLeft: string;
		const dragLayer = document.querySelector<HTMLDivElement>("#drag-layer")!;

		const onMouseMove = (event: MouseEvent) => {
			event.preventDefault();

			const mousePosition = {
				x: event.clientX,
				y: event.clientY,
			};
			div.style.left = mousePosition.x + offset[0] + "px";
			div.style.top = mousePosition.y + offset[1] + "px";
		};

		function getLowerPillarElem(event: MouseEvent): HTMLDivElement | null {
			div.hidden = true;
			const elemBelow = document.elementFromPoint(
				event.clientX,
				event.clientY
			);
			div.hidden = false;
			if (elemBelow) {
				if (elemBelow.closest(".market")) {
					return null;
				}
				const pillarDiv = elemBelow.closest(".pillar");
				return pillarDiv as HTMLDivElement;
			}
			return null;
		}

		const onMouseUp = (event: MouseEvent) => {
			event.preventDefault();
			event.stopPropagation();
			div.style.zIndex = zIndex;
			///  get entities
			const lowerElem = getLowerPillarElem(event) ?? null;
			const success = this.makeMove(div, lowerElem);
			if (!lowerElem || !success) {
				console.log("reached reset");
				//reset position here if no movement is made
				if (originalParent.closest(".market")) {
					//reset differently when src is market
					console.log("reached market reset");
					div.style.top = "0";
					div.style.left = MARKET_OFFSET;
					//reset differently for cards that begin a slice on the waste pile
					if (originalParent.closest(".waste")) {
						console.log("reset left here");
						div.style.left = originalLeft;
					}
				} else {
					div.style.left = "0";
					if (
						originalParent?.classList.contains("pillar") || //first card on the pillar
						div.closest(".foundation")
					) {
						// or is from the foundation
						div.style.top = "0px";
					} else {
						div.style.top = div.classList.contains("faceup")
							? PILLAR_FACEUP_OFFSET
							: PILLAR_FACEDOWN_OFFSET;
					}
				}
				//remove from drag layer and return to parent
				originalParent.appendChild(div);
				div.classList.remove("dragging");
			}
			document.removeEventListener("mousemove", onMouseMove);
			document.removeEventListener("mouseup", onMouseUp);
		};

		div.addEventListener("mousedown", (e: MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();
			if (div.classList.contains("faceup")) {
				//save original data for potential reset
				zIndex = div.style.zIndex;
				originalParent = div.parentElement as HTMLDivElement;
				originalLeft = div.style.left;
				div.style.zIndex = "200";

				//only allow top card on waste to be dragged
				if (div.closest(".waste")) {
					const wasteDiv =
						document.querySelector<HTMLDivElement>(".waste")!;
					const card = this.sprites.get(div)!;
					const waste = this.sprites.get(wasteDiv)!;
					const wasteCards = this.world.pileCards.get(waste)!.cards;
					if (
						!wasteCards.length ||
						card !== wasteCards[wasteCards.length - 1]
					) {
						return;
					}
				}

				//prevent snapping when moved to drag layer
				div.classList.add("dragging");
				const rect = div.getBoundingClientRect();
				offset = [rect.left - e.clientX, rect.top - e.clientY];
				div.style.left = rect.left + "px";
				div.style.top = rect.top + "px";
				div.style.width = rect.width + "px";
				div.style.height = rect.height + "px";

				//append to drag layer
				dragLayer.append(div);
				document.addEventListener("mousemove", onMouseMove);
				document.addEventListener("mouseup", onMouseUp);
			}
		});
	}

	addClickListener(div: HTMLDivElement) {
		const entity = this.sprites.get(div)!;
		const pile = this.world.pileType.get(entity);
		if (pile) {
			switch (pile.kind) {
				case "stock":
					div.addEventListener("click", () => {
						const wasteDiv =
							document.querySelector<HTMLDivElement>(".waste")!;
						const stockCards =
							this.world.pileCards.get(entity)!.cards;
						if (stockCards.length) {
							const stockCardDiv = this.entityToSprites.get(
								stockCards[stockCards.length - 1]
							)!;
							return this.makeMove(stockCardDiv, wasteDiv);
						}
						const waste = this.sprites.get(wasteDiv)!;
						const wasteCards = this.world.pileCards.get(waste)!.cards;
						if (wasteCards.length) {
							const topWasteCard =
								wasteCards[wasteCards.length - 1];
							const topWasteCardDiv =
								this.entityToSprites.get(topWasteCard)!;
							this.makeMove(topWasteCardDiv, div);
						}
					});
					break;
				default:
					break;
			}
		}
	}
}
