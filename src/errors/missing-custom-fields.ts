export class MissingCustomFields extends Error {
    public constructor(listOfFields: string[]) {
        super(`Missing some custom fields, please check your installation. ${listOfFields.join(", ")}`);
    }
}
