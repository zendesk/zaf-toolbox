import {
    Capabilities,
    IContentCarousel,
    IContentText,
    IItem,
    ILinkAction,
    ILocationRequestAction,
    IPostbackAction,
    IReplyAction
} from "@models/index";
import { buildCSSRow, convertContentMessageToHtml } from "@utils/convert-content-message-to-html";
import "@testing-library/jest-dom";

enum AGENT_WORKSPACE_STYLE {
    ZENDESK_SDK = "ZENDESK",
    SUNSHINE_CONVERSATION_SDK = "SUNSHINE_CONVERSATION_SDK"
}

describe("convertContentMessageToHtml", () => {
    const linkAction: ILinkAction = {
        type: Capabilities.Link,
        text: "link text",
        uri: "test.com"
    };

    describe("Unknown Action", () => {
        it("should return default string if type not supported", () => {
            const result = convertContentMessageToHtml({
                type: Capabilities.Image,
                mediaUrl: "https://image.com",
                text: "test"
            });

            expect(result).toEqual("Impossible to render message.");
        });
    });

    describe("Actions", () => {
        it("LocationRequest - should render a disabled button", () => {
            const action: ILocationRequestAction = {
                type: Capabilities.LocationRequest,
                text: "locationRequest text"
            };

            const result = convertContentMessageToHtml({ type: Capabilities.Text, text: "", actions: [action] });

            expect(result).toMatch(new RegExp(`<p style=".*cursor: not-allowed;.*">${action.text}</p>`, "g"));
        });

        it("Link - should render a clickable button", () => {
            const result = renderHtmlString(
                convertContentMessageToHtml({ type: Capabilities.Text, text: "", actions: [linkAction] }, true)
            );

            const link = result.querySelectorAll("a");
            expect(link).toHaveLength(1);
            expect(link[0]).toHaveAttribute("href", linkAction.uri);
            expect(link[0]).toContainHTML(linkAction.text);
            expect(link[0]).not.toBeDisabled();
        });

        it("Reply - should render the buttons outlined disabled and in a row", () => {
            const replyAction: IReplyAction = { type: Capabilities.Reply, text: "TEST", payload: "TEST" };
            const result = convertContentMessageToHtml(
                {
                    type: Capabilities.Text,
                    text: "",
                    actions: [replyAction]
                },
                true
            );

            expect(result).toMatch(
                new RegExp(
                    `<div style=['"]display: flex; flex-direction: row;['"]><p style=['"].*cursor: not-allowed.*['"]>${replyAction.text}</p></div>`,
                    "g"
                )
            );
        });

        it("Postback - should render the buttons disabled", () => {
            const postbackAction: IPostbackAction = { type: Capabilities.Postback, text: "TEST", payload: "TEST" };
            const result = convertContentMessageToHtml(
                {
                    type: Capabilities.Text,
                    text: "",
                    actions: [postbackAction]
                },
                true
            );

            expect(result).toMatch(
                new RegExp(`<p style=['"].*cursor: not-allowed.*['"]>${postbackAction.text}</p>`, "g")
            );
        });
    });

    describe("Text message", () => {
        const message: IContentText = {
            type: Capabilities.Text,
            text: "Text message"
        };

        it("should return the text in multiple p tag and nothing else with: SUNSHINE CONVERSATION style", () => {
            const result = convertContentMessageToHtml({ ...message, text: "Line1\nLine2\nLine3" }, true);
            expect(result).toContain("<p>Line1</p><p>Line2</p><p>Line3</p>");
            expect(result).not.toContain("</a>");
        });

        it("should return the text in a single p tag and nothing else with: SUNSHINE CONVERSATION style", () => {
            const result = convertContentMessageToHtml(message, true);
            expect(result).toContain(`<p>${message.text}</p>`);
            expect(result).not.toContain("</a>");
        });

        it("should return the text in a p tag and the actions with: SUNSHINE CONVERSATION style", () => {
            const result = renderHtmlString(
                convertContentMessageToHtml(
                    {
                        ...message,
                        actions: [linkAction, { ...linkAction, text: "2" }]
                    },
                    true
                )
            );

            const link = result.querySelectorAll("a");
            expect(link).toHaveLength(2);
            expect(link[0]).toHaveAttribute("href", linkAction.uri);
            expect(link[0]).toContainHTML(linkAction.text);

            expect(link[1]).toHaveAttribute("href", linkAction.uri);
            expect(link[1]).toContainHTML("2");

            const description = result.querySelector("p");
            expect(description).toContainHTML(message.text);
        });

        it("should return the text in a single p tag and nothing else with: ZENDESK style", () => {
            const result = renderHtmlString(convertContentMessageToHtml(message, false));

            // Span doesn't have any children
            const span = result.querySelectorAll("span");
            expect(span).toHaveLength(1);
            expect(span[0]).toContainHTML(message.text);

            const links = result.querySelectorAll("a");
            expect(links).toHaveLength(0);
        });
    });

    describe("Carousel message", () => {
        const genericItem: IItem = {
            title: "Item",
            description: "$100 | lorem...",
            mediaUrl: "https://picsum.photos/200",
            actions: []
        };

        const message: IContentCarousel = {
            type: Capabilities.Carousel,
            items: [genericItem]
        };

        Object.values(AGENT_WORKSPACE_STYLE).forEach((style) => {
            it("should return a list with one item without actions with: " + style, () => {
                const result = renderHtmlString(
                    convertContentMessageToHtml(message, style === AGENT_WORKSPACE_STYLE.SUNSHINE_CONVERSATION_SDK)
                );

                const link = result.querySelectorAll("a");
                expect(link).toHaveLength(0);

                const titles = result.querySelectorAll("h5");
                expect(titles).toHaveLength(1);
            });

            it("should return a list with one item without actions with: " + style, () => {
                const result = renderHtmlString(
                    convertContentMessageToHtml(message, style === AGENT_WORKSPACE_STYLE.SUNSHINE_CONVERSATION_SDK)
                );

                const link = result.querySelectorAll("a");
                expect(link).toHaveLength(0);

                const titles = result.querySelectorAll("h5");
                expect(titles).toHaveLength(1);
            });

            it("should return a list with one item and one action with: " + style, () => {
                const result = renderHtmlString(
                    convertContentMessageToHtml(
                        {
                            ...message,
                            items: [{ ...genericItem, actions: [linkAction] }]
                        },
                        style === AGENT_WORKSPACE_STYLE.SUNSHINE_CONVERSATION_SDK
                    )
                );

                const link = result.querySelectorAll("a");
                expect(link).toHaveLength(1);
                expect(link[0]).toHaveAttribute("href", linkAction.uri);
                expect(link[0]).toContainHTML(linkAction.text);

                const titles = result.querySelectorAll("h5");
                expect(titles).toHaveLength(1);
            });

            it("should return a list with multiple items with: " + style, () => {
                const result = renderHtmlString(
                    convertContentMessageToHtml(
                        {
                            ...message,
                            items: [genericItem, genericItem]
                        },
                        style === AGENT_WORKSPACE_STYLE.SUNSHINE_CONVERSATION_SDK
                    )
                );

                const link = result.querySelectorAll("a");
                expect(link).toHaveLength(0);

                const titles = result.querySelectorAll("h5");
                expect(titles).toHaveLength(2);
            });
        });
    });
});

/**
 * Render an HTML string in HTMLDivElement
 */
function renderHtmlString(htmlString: string): HTMLDivElement {
    const node = document.createElement("div");
    node.innerHTML = htmlString;

    return node;
}

describe("buildCSSRow", () => {
    it("should return a good css row", () => {
        const result = buildCSSRow({
            marginBottom: "10px",
            marginTop: "10px",
            background: "red"
        });

        expect(result).toStrictEqual("margin-bottom:10px;margin-top:10px;background:red;");
    });
});
