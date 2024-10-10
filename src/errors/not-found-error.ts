export class NotFoundError extends Error {
    public constructor(searchedFor: string) {
        super(`${searchedFor} wasn't found.`);
    }
}
