import type { Entity } from './components';
import { Animate } from './services/animate';
import './style.css'
import { shareCards, shuffle, World } from './world';

var app = document.querySelector<HTMLDivElement>('#app')!;

//setup drag layer
var dragLayer = document.createElement('div')!;
dragLayer.id = "drag-layer"
app.appendChild(dragLayer);

var top = document.createElement("div");
top.classList.add("top");

const world = new World();
const animationService = new Animate(world);

//create piles
const tableaus = Array.from({ length: 7 }, () =>
    world.createPile("tableau")
);
const foundations = Array.from({ length: 4 }, () =>
    world.createPile("foundation")
);
const stock = world.createPile("stock");
const waste = world.createPile("waste");

var foundationDivs = foundations.map(x => animationService.createEntitySprite(x,"Pile"));
var stockDiv = animationService.createEntitySprite(stock, "Pile");
stockDiv.classList.add("left");
var wasteDiv = animationService.createEntitySprite(waste,"Pile");
wasteDiv.classList.add("right");
var market = document.createElement("div");
market.classList.add("market");
market.appendChild(stockDiv);
market.appendChild(wasteDiv);

var foundation = document.createElement("div");
foundation.classList.add("foundation");
foundationDivs.forEach(x => foundation.appendChild(x));

top.appendChild(market);
top.appendChild(foundation);
app.appendChild(top);

//setup tableaus
var tableauDivs = tableaus.map(x => animationService.createEntitySprite(x,"Pile"));
var board = document.createElement("div");
board.classList.add("board");
tableauDivs.forEach(x => board.appendChild(x));
//create cards
const deck: Entity[] = [];
world.createCards(deck);
deck.forEach(x => animationService.createEntitySprite(x,"Card"));
shuffle(deck);
//deal cards to deck 
shareCards(world,tableaus,deck,stock);
//update pile divs
// foundations.forEach(x => animationService.updatePileSprite(x));
tableaus.forEach(x => animationService.updatePileSprite(x));
animationService.updatePileSprite(stock);
animationService.addClickListener(stockDiv);
app.appendChild(board);



