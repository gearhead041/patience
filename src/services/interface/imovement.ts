import type { Move, MoveHistory } from "../../components";

export interface IMovement {
    moves: MoveHistory[];
    moveCard(move: Move): boolean;
    undo(): void;
}