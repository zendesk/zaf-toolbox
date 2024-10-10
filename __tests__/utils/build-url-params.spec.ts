import { buildUrlParams } from "@utils/index";

describe("buildUrlParams", () => {
    it("should build a valid string if one parameter is sent", () => {
        expect(
            buildUrlParams({
                "foo": "bar"
            })
        ).toStrictEqual("foo=bar");
    });

    it("should build a valid string if two parameter is sent", () => {
        expect(
            buildUrlParams({
                "foo": "bar",
                "fizz": "buzz"
            })
        ).toStrictEqual("foo=bar&fizz=buzz");
    });

    it("should build a valid string if nested object is sent", () => {
        expect(
            buildUrlParams({
                "filters": {
                    "foo": "bar",
                    "fizz": "buzz"
                },
                "page": {
                    "size": 25
                }
            })
        ).toStrictEqual("filters[foo]=bar&filters[fizz]=buzz&page[size]=25");
    });

    it("should build a valid string if deeper nested object is sent", () => {
        expect(
            buildUrlParams({
                "filters": {
                    "foo": "bar",
                    "fizz": {
                        "john": "doe"
                    }
                },
                "page": {
                    "size": 25
                }
            })
        ).toStrictEqual("filters[foo]=bar&filters[fizz][john]=doe&page[size]=25");
    });

    it("should build a valid string if one undefined is sent", () => {
        expect(
            buildUrlParams({
                "filters": {
                    "foo": "bar",
                    "fizz": "buzz"
                },
                "page": undefined
            })
        ).toStrictEqual("filters[foo]=bar&filters[fizz]=buzz");
    });

    it("should build a valid string if string is sent", () => {
        expect(
            buildUrlParams({
                "url": "https://mozilla.org/?x=шеллы"
            })
        ).toStrictEqual("url=https://mozilla.org/?x=%D1%88%D0%B5%D0%BB%D0%BB%D1%8B");
    });
});
