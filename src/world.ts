import type { CardData, Entity, Faceup, InPile, PileCards, PileKind, PileType, Suit } from "./components";

function shuffle<T>(array: T[], rng = Math.random) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

export class EntityManager {
    nextEntity = 0;
    // card components
    cards = new Map<Entity, CardData>();
    faceUp = new Map<Entity, Faceup>();
    inPile = new Map<Entity, InPile>();


    // pile components
    pileType = new Map<Entity, PileType>();
    pileCards = new Map<Entity, PileCards>();

    createEntity(): Entity {
        return this.nextEntity++;
    }

    createPile(kind: PileKind): Entity {
        const pile = this.createEntity();
        this.pileType.set(pile, { kind });
        this.pileCards.set(pile, { cards: [] });
        return pile;
    }

    createCards(deck :Entity[]) {
        for (const suit of suits) {
            for (const rank of ranks) {
                var card = world.createEntity();
                world.cards.set(card, {suit, rank});
                world.faceUp.set(card,{value: false});
                deck.push(card);
            }
        }
    }
}



var world = new EntityManager();

//create piles
const tableaus = Array.from({ length: 7 }, () =>
    world.createPile("tableau")
);

const foundations = Array.from({ length: 4 }, () =>
    world.createPile("foundation")
);

const stock = world.createPile("stock");
const waste = world.createPile("waste");


//create cards
const suits: Suit[] = [
    { color: "Red", shape: "Heart" },
    { color: "Red", shape: "Diamond" },
    { color: "Black", shape: "Spade" },
    { color: "Black", shape: "Club" },
];

const ranks: CardData["rank"][] = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13
];

const deck: Entity[] = [];
world.createCards(deck);
shuffle(deck);

//deal cards to deck 
//TODO later add animations to this part

let deckIndex = 0;

for (let i = 0; i < tableaus.length; i++) {
  const tableau = tableaus[i];
  const pileCards = world.pileCards.get(tableau)!.cards;

  // deal from to to 1 to 7 card incrementtally;
  for (let j = 0; j <= i; j++) {
    const card = deck[deckIndex++];
    
    pileCards.push(card);
    world.inPile.set(card, { pile: tableau, index: j });
  }

  // flip top card
  const topCard = pileCards[pileCards.length - 1];
  world.faceUp.get(topCard)!.value = true;
}

const stockCards = world.pileCards.get(stock)!.cards;

while (deckIndex < deck.length) {
  const card = deck[deckIndex++];
  const index = stockCards.length;

  stockCards.push(card);
  world.inPile.set(card, { pile: stock, index });
}