// Card data
type SuitColor = "Red" | "Black";
type SuitShape = "Heart" | "Spade" | "Diamond" | "Club";

interface Suit {
  color: SuitColor;
  shape: SuitShape;
}

type Entity = number;
type EntityName = "Card" | "Pile";
interface CardData {
  suit: Suit;
  rank: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
}

//Card state
type Faceup = {
  value: boolean;
}

interface InPile {
  pile: Entity;
  index: number;
}

//Pile Components
type PileKind = "tableau" | "foundation" | "stock" | "waste";

interface PileType {
  kind: PileKind;
}

interface PileCards {
  cards: Entity[]; // ordered card entity IDs
}


//movement
interface Move {
  dest: Entity;
  card: Entity;
}

export type {
  Suit,
  PileType,
  PileCards,
  CardData,
  Faceup,
  InPile,
  Entity,
  PileKind,
  Move,
  EntityName
};