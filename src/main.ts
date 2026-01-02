import type { Entity } from './components';
import { Animate } from './services/animate';
import './style.css'
import { shareCards, shuffle, World } from './world';

const app = document.querySelector<HTMLDivElement>("#app")!;

// Setup World & Services
const world = new World();
const animationService = new Animate(world);

// Setup Drag Layer
const dragLayer = document.createElement("div");
dragLayer.id = "drag-layer";
app.appendChild(dragLayer);

// Create Piles (Logic)
const stock = world.createPile("stock");
const waste = world.createPile("waste");
const foundations = Array.from({ length: 4 }, () =>
	world.createPile("foundation")
);
const tableaus = Array.from({ length: 7 }, () => world.createPile("tableau"));

// Create DOM Structure

// 1. Top Section
const top = document.createElement("div");
top.classList.add("top");

// Market
const market = document.createElement("div");
market.classList.add("market");

const stockDiv = animationService.createEntitySprite(stock, "Pile");
stockDiv.classList.add("left");
animationService.addClickListener(stockDiv);

const wasteDiv = animationService.createEntitySprite(waste, "Pile");
wasteDiv.classList.add("right");

market.appendChild(stockDiv);
market.appendChild(wasteDiv);


//undo button
const undoButton = document.createElement("button");
undoButton.textContent = "Undo";
undoButton.classList.add("undo-button");
undoButton.addEventListener("click", () => {
	animationService.undo();
});
// Foundations
const foundation = document.createElement("div");
foundation.classList.add("foundation");
foundations.forEach((f) => {
	foundation.appendChild(animationService.createEntitySprite(f, "Pile"));
});

top.appendChild(market);
top.appendChild(undoButton);
top.appendChild(foundation);
app.appendChild(top);

// 2. Board Section
const board = document.createElement("div");
board.classList.add("board");
tableaus.forEach((t) => {
	board.appendChild(animationService.createEntitySprite(t, "Pile"));
});
app.appendChild(board);

// Create & Deal Cards
const deck: Entity[] = [];
world.createCards(deck);
deck.forEach((card) => animationService.createEntitySprite(card, "Card"));

shuffle(deck);
shareCards(world, tableaus, deck, stock);

// Initial Render
tableaus.forEach((t) => animationService.updatePileSprite(t));
animationService.updatePileSprite(stock);
