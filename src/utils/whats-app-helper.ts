import { IContentTemplate, ITemplate, ITemplateComponentParameters } from "@models/index";

/**
 * Convert a WhatsApp template into a valid IContent for Sunshine Conversation Api Service
 */
export function convertToContent(
    template: ITemplate,
    componentParameters: ITemplateComponentParameters[]
): IContentTemplate {
    return {
        "type": "template",
        template: {
            name: template.name,
            language: {
                policy: "deterministic",
                code: template.language
            },
            components: componentParameters
        }
    };
}
