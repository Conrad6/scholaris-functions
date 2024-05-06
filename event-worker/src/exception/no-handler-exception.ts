export class NoHandlerException extends Error {
    constructor(event: string) {
        super('No such handler for event: ' + event);
    }
}
