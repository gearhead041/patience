import type { Entity, EntityName, Move } from "../components";
import {
	MARKET_FLIP_COUNT,
	MARKET_OFFSET,
	PILLAR_FACEDOWN_OFFSET,
	PILLAR_FACEUP_OFFSET,
} from "../constants";
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
		var div = document.createElement("div");
		switch (entityName) {
			case "Card":
				var cardData = this.world.cards.get(entity)!;
				div.className = "card";
				div.classList.add(cardData.suit.shape.toLowerCase());
				div.classList.add("facedown");
				this.addDragEventListener(div);
				break;
			case "Pile":
				div.classList.add("pillar");
				var pileType = this.world.pileType.get(entity)!.kind;
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
		var pileDiv = this.entityToSprites.get(entity)!;
		var pileCards = this.world.pileCards.get(entity)!.cards;
		var cardDivs = pileCards.map((x) => this.entityToSprites.get(x)!);
		var pileType = this.world.pileType.get(entity)!.kind;

		switch (pileType) {
			case "waste":
				console.log("update waste pile");
				var stepBack = Math.min(cardDivs.length, MARKET_FLIP_COUNT);
				var addedArray = cardDivs.slice(-stepBack);
				addedArray.forEach((c, i) => {
					var card =
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
					var cardData = this.world.cards.get(card)!;
					var isFaceup = this.world.faceUp.get(card)!.value;
					if (isFaceup && c.classList.contains("facedown")) {
						c.classList.replace("facedown", "faceup");
						var textNode = document.createElement("div");
						textNode.classList.add("card-face");
						textNode.textContent = cardData.rank.toString();
						c.appendChild(textNode);
					}
				});

				pileDiv.appendChild(
					cardDivs[cardDivs.length - MARKET_FLIP_COUNT]
				);
				addedArray.reduce((p, c) => p.appendChild(c));
				break;
			default:
				if (pileCards.length) {
					pileCards.forEach((c, i) => {
						var cardDiv = this.entityToSprites.get(c)!;
						var cardData = this.world.cards.get(c)!;
						cardDiv.style.zIndex = i.toString();
						cardDiv.style.left = ""; // Reset drag position to snap to parent/pillar
						cardDiv.style.right = "";
						cardDiv.style.top = "0";
						var isFaceup = this.world.faceUp.get(c)!.value;

						if (
							isFaceup &&
							cardDiv.classList.contains("facedown")
						) {
							cardDiv.classList.replace("facedown", "faceup");
							var textNode = document.createElement("div");
							textNode.classList.add("card-face");
							textNode.textContent = cardData.rank.toString();
							cardDiv.appendChild(textNode);
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
	}

	private makeMove(
		src: HTMLDivElement,
		dest: HTMLDivElement | null
	): boolean {
		try {
			if (!dest) {
				console.log("no lower element found");
				return false;
			}
			var card = this.sprites.get(src)!;
			var destPile = this.sprites.get(dest)!;
			var srcPile = this.world.inPile.get(card)!.pile;
			const move: Move = {
				card: card,
				dest: destPile,
			};
			var result = this.movementService.moveCard(move);
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

	///add draggable event listener
	private addDragEventListener(div: HTMLDivElement) {
		var offset = [0, 0];
		var zIndex: string;
		var originalParent: HTMLDivElement;
		var originalLeft: string;
		var dragLayer = document.querySelector<HTMLDivElement>("#drag-layer")!;

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
			div.style.zIndex = zIndex;

			///  get entities
			var lowerElem = getLowerPillarElem(event) ?? null;
			var success = this.makeMove(div, lowerElem);
			if (!lowerElem || !success) {
				console.log("reached reset");

				if (originalParent.closest(".market")) {
					//reset differently when src is market pillar
					console.log("reached market reset");

					div.style.left = MARKET_OFFSET;
					//reset differently for cards that begin a slice on the right pillar
					if (div.closest("right")) {
						console.log("reset here");

						div.style.left = originalLeft;
					}
					div.style.top = "0";
				} else {
					//reset position here here if no movement is made
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
					var wasteDiv = document.querySelector<HTMLDivElement>(".waste")!;
					var card = this.sprites.get(div)!;
					var waste = this.sprites.get(wasteDiv)!;
					var wasteCards = this.world.pileCards.get(waste)!.cards;
					if (!wasteCards.length || card !== wasteCards[wasteCards.length - 1]) {
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
		var entity = this.sprites.get(div)!;
		var pile = this.world.pileType.get(entity);
		if (pile) {
			switch (pile.kind) {
				case "stock":
					div.addEventListener("click", () => {
						//move to waste if any cards move from stock to waste if empty
						var wasteDiv =
							document.querySelector<HTMLDivElement>(".waste")!;
						var srcCards = this.world.pileCards.get(entity)!.cards;
						var srcCardDiv = this.entityToSprites.get(
							srcCards[srcCards.length - 1]
						)!;
						this.makeMove(srcCardDiv, wasteDiv);
					});
					return;
				default:
					break;
			}
		}
	}
}
