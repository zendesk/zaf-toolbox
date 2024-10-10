interface IObject {
    [key: string]: string | boolean | number | undefined | IObject;
}

/**
 * Transform an object into URL string
 */
export function buildUrlParams(params: IObject, parent?: string): string {
    return Object.keys(params)
        .filter((key) => params[key] !== undefined)
        .map((key) => {
            let value = params[key];

            if (value instanceof Object) {
                return buildUrlParams(params[key] as IObject, parent ? `${parent}[${key}]` : key);
            }

            if (typeof value === "string") {
                value = encodeURI(value);
            }

            return `${parent ? `${parent}[${key}]` : key}=${value}`;
        })
        .join("&");
}
