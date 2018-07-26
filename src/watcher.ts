import { EventEmitter } from "events";

export class Watcher extends EventEmitter {
	public closed = false;

	constructor(public readonly name: string) {
		super();
	}

	public destroy() {
		this.closed = true;
		this.emit('close');
		this.removeAllListeners();
	}
}
