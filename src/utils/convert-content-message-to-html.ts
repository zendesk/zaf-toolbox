import { Capabilities, IAction, IContent, IContentCarousel, IContentText, IItem } from "@models/index";
import { PALETTE } from "@zendeskgarden/react-theming";
import { CSSProperties } from "react";

export function convertContentMessageToHtml(
    content: IContent,
    useSunshineConversationDesignForAgentWorkspace = true
): string {
    switch (content.type) {
        case Capabilities.Carousel:
            return useSunshineConversationDesignForAgentWorkspace
                ? SunshineConversationCarousel(content)
                : ZendeskCarousel(content);
        case Capabilities.Text:
            return useSunshineConversationDesignForAgentWorkspace
                ? SunshineConversationText(content)
                : ZendeskText(content);
        default:
            return "Impossible to render message.";
    }
}

// #region Sunshine conversation
/**
 * Convert a text message into HTML string with Sunshine conversation style
 */
function SunshineConversationText(content: IContentText): string {
    const containerStyle = `border: 1px solid ${PALETTE.grey[300]}; border-radius: 20px; padding: 16px; width: fit-content`;

    let html = `<p>${convertTextToHtml(content.text)}</p>`;

    if (content.actions) {
        const replyActions = [];
        html = `<div style="${containerStyle}">${html}<div style="display: flex; flex-direction: column;padding-top: 10px">`;

        for (const action of content.actions) {
            if (action.type === Capabilities.Reply) {
                replyActions.push(convertActionToHtml(action));
            } else {
                html += `${convertActionToHtml(action)}`;
            }
        }

        if (replyActions.length > 0) {
            html += `<div style="display: flex; flex-direction: row;">${replyActions.join("")}</div>`;
        }
        html += "</div></div>";
    }

    return html;
}

/**
 * Convert a carousel message into an HTML string with Sunshine conversation style
 */
function SunshineConversationCarouselItem(item: IItem): string {
    const img = item.mediaUrl
        ? `<img
            src="${item.mediaUrl}"
            style="${buildCSSRow({
                objectFit: "cover",
                height: "auto",
                overflow: "hidden",
                borderRadius: "20px 20px 0 0"
            })}"
            alt="${item.altText}" />`
        : "";

    const description = item.description
        ? `<p style="${buildCSSRow({
              lineHeight: "20px",
              margin: "4px 0"
          })}">${convertTextToHtml(item.description, "p", "line-height: 20px")}</p>`
        : "";

    return `
        <div style="${buildCSSRow({
            border: "1px solid " + PALETTE.grey[300],
            borderRadius: "20px",
            maxWidth: "276px",
            display: "grid",
            marginRight: "5px"
        })}">
            ${img}
            <div style="${buildCSSRow({
                margin: "16px 16px",
                display: "inherit",
                flexDirection: "inherit",
                lineHeight: "20px"
            })}">
                <h5 style="${buildCSSRow({
                    fontSize: "14px",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                })}">
                    ${item.title}
                </h5>
                ${description}
                <div style="${buildCSSRow({
                    marginTop: "12px",
                    display: "inherit",
                    flexDirection: "inherit"
                })}">
                    ${item.actions
                        .map((action, index) => convertActionToHtml(action, index === item.actions.length - 1))
                        .join("")}
                </div>
            </div>
        </div>
    `;
}

/**
 * Convert a carousel message into an HTML string with Sunshine conversation style
 */
function SunshineConversationCarousel(content: IContentCarousel): string {
    return `
        <div style="${buildCSSRow({
            overflow: "hidden"
        })}">
            <div style="${buildCSSRow({
                display: "flex",
                overflowX: "auto"
            })}">
                ${content.items.map((item) => SunshineConversationCarouselItem(item)).join("")}
            </div>
        </div>
    `;
}

function convertTextToHtml(text: string, tagToUse = "p", style?: string): string {
    if (style) {
        return text.replaceAll("\n", `</${tagToUse}><${tagToUse} style="${style}">`);
    }
    return text.replaceAll("\n", `</${tagToUse}><${tagToUse}>`);
}

// #endregion

// #region Zendesk
/**
 * Convert a text message into HTML string with Zendesk style
 */
function ZendeskText(content: IContentText): string {
    const actions =
        content.actions
            ?.map((action, index) =>
                convertActionToHtml(action, index === (content.actions as IAction[]).length - 1, PALETTE.mint[600])
            )
            .join() ?? "";

    return `
        <div style="${buildCSSRow({
            padding: "0.5rem 0.75rem",
            minWidth: "3.25rem",
            maxWidth: "17.5rem",
            display: "block",
            width: "100%",
            overflow: "hidden",
            borderColor: PALETTE.grey[300],
            backgroundColor: PALETTE.grey[200],
            borderRadius: "1.25rem"
        })}">
            <span style="${buildCSSRow({
                whiteSpace: "pre-wrap",
                overflowWrap: "break-word",
                fontSize: "0.875rem",
                lineHeight: "1.25rem"
            })}">
                ${content.text}
            </span>
            ${
                actions !== ""
                    ? `
                        <div style="${buildCSSRow({
                            maxWidth: "100%",
                            width: "100%",
                            display: "flex",
                            flexDirection: "column"
                        })}">
                            ${actions}
                        </div>`
                    : ""
            }
        </div>
    `;
}

/**
 * Convert a Carousel message into an HTML string with Zendesk style
 */
function ZendeskCarousel(content: IContentCarousel): string {
    const items = content.items.map((item) => ZendeskCarouselItem(item)).join("");

    return `
        <div style="${buildCSSRow({
            display: "flex"
        })}">
            ${items}
        </div>
    `;
}

/**
 * Convert a Carousel item into an HTML string with Zendesk style
 */
function ZendeskCarouselItem(item: IItem): string {
    const actions = item.actions
        .map((action, index) => {
            return `
                <a href="${"uri" in action ? action.uri : "#"}"
                    target="_blank"
                    aria-label="${action.text}"
                    style="${buildCSSRow({
                        flex: "0 0 auto",
                        display: "block",
                        padding: "0.75rem 0px",
                        fontSize: "0.875rem",
                        textAlign: "center",
                        border: "1px solid " + PALETTE.grey[300],
                        borderTop: "none",
                        borderRadius:
                            (item.actions.length > 1 && item.actions.length === index + 1) || item.actions.length === 1
                                ? "0px 0px 1.25rem 1.25rem"
                                : "unset",
                        textDecoration: "none",
                        color: "uri" in action ? PALETTE.green[600] : PALETTE.grey[600],
                        pointerEvents: "uri" in action ? "auto" : "none"
                    })}">
                    ${action.text}
                </a>
            `;
        })
        .join("");

    const img = item.mediaUrl
        ? `<img src="${item.mediaUrl}"
            style="${buildCSSRow({
                height: "9.125rem",
                objectFit: "cover",
                transition: "opacity 0.2s linear 0s",
                width: "17.75rem",
                display: "block"
            })}"
          alt="${item.altText}" />`
        : "";

    return `
        <div style="${buildCSSRow({
            position: "relative",
            flex: "0 0 calc((100% - 3.25rem) - 4rem)",
            maxWidth: "17.5rem",
            display: "block",
            scrollSnapAlign: "start",
            marginRight: "0.5rem"
        })}">
            <div style="${buildCSSRow({
                flex: "1 0 auto",
                borderRadius: "1.25rem 1.25rem 0px 0px",
                border: "1px solid",
                borderColor: PALETTE.grey[300],
                overflow: "hidden"
            })}">
                ${img}
                <div style="${buildCSSRow({
                    padding: "1rem"
                })}">
                    <h5 style="${buildCSSRow({
                        fontSize: "0.875rem",
                        lineHeight: "1.25rem",
                        fontWeight: 600
                    })}">
                        ${item.title}
                    </h5>
                    <div style="${buildCSSRow({
                        fontSize: "0.875rem",
                        lineHeight: "1.25rem",
                        fontWeight: "normal"
                    })}">
                        ${item.description}
                    </div>
                </div>
            </div>
            <div >
                ${actions}
            </div>
        </div>
    `;
}

// #endregion

// #region Utils
/**
 * Transform a CSS property object in inline css style row
 */
export function buildCSSRow(properties: CSSProperties): string {
    return Object.keys(properties).reduce((accumulator, key) => {
        // transform the key from camelCase to kebab-case
        const regex = new RegExp(/[A-Z]/g);
        const cssKey = `${key}`.replace(regex, (v) => `-${v.toLowerCase()}`);
        // remove ' in value
        const cssValue = `${properties[key as keyof CSSProperties]}`.replace(/'/, "");
        // build the result
        // you can break the line, add indent for it if you need
        return `${accumulator}${cssKey}:${cssValue};`;
    }, "");
}

/**
 * Convert a action into HTML string.
 */
function convertActionToHtml(
    action: IAction,
    lastAction = false,
    activeBackgroundColor: string = PALETTE.blue[600]
): string {
    const baseStyle = `border-radius: 25px;padding: 10px 25px;text-decoration: none; text-align: center;${
        lastAction ? "" : "margin-bottom: 4px;"
    }`;
    const enabledStyle = `color: white; background-color: ${activeBackgroundColor};${baseStyle}`;
    const disabledStyle = `cursor: not-allowed;border: 1px solid;border-color: ${PALETTE.grey[400]};background-color: ${PALETTE.grey[400]};${baseStyle}`;
    const disabledStrokeStyle = `cursor: not-allowed;color: ${PALETTE.grey[400]};border: 1px solid;border-color: ${PALETTE.grey[400]};${baseStyle}`;

    switch (action.type) {
        case Capabilities.LocationRequest:
            return `<p style="${disabledStrokeStyle}">${action.text}</p>`;
        case Capabilities.Link:
            return `<a style="${enabledStyle}" href="${action.uri}" target="_blank;">${action.text}</a>`;
        case Capabilities.Postback:
            return `<p style="${disabledStyle};cursor: not-allowed;">${action.text}</p>`;
        case Capabilities.Reply:
            return `<p style="${disabledStrokeStyle};cursor: not-allowed;width: fit-content;margin-right: 5px">${action.text}</p>`;
        default:
            return `<p>${action.text}</p>`;
    }
}

// #endregion
