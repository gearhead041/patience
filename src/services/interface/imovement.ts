import type { Move } from "../../components";

export interface IMovement {
    moves: Move[];
    moveCard(move: Move): boolean;
    undo(): void;
}