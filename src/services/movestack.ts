export class MoveStack<T> {
	private readonly moveStack: T[];
	private readonly capacity: number;
	private readonly undoneStack: T[] = [];

	constructor(capacity: number) {
		this.capacity = capacity +1; //because one slot is unused to differentiate full vs empty
		this.moveStack = new Array(this.capacity);
	}

	push(state: T): void {
		this.moveStack.push(state);
		if (this.moveStack.length > this.capacity) {
			this.moveStack.shift();
		}
	}

	pop(): T | undefined {	
		var lastMove = this.moveStack.pop();
		if (lastMove) {
			this.undoneStack.push(lastMove);
		}
		return lastMove;
	}

	redo(): T | undefined {
		var lastUndone = this.undoneStack.pop();
		if (lastUndone) {
			this.moveStack.push(lastUndone);
		}
		return lastUndone;
	}
	
}
