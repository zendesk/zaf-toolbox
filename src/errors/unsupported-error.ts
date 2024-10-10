export class UnsupportedError extends Error {
    public constructor(message: string) {
        super(`${message} isn't supported.`);
    }
}
