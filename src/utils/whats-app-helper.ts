import { IContentTemplate, ITemplate, ITemplateComponentParameters } from "@models/index";

/**
 * Convert a WhatsApp template into a valid IContent for Sunshine Conversation Api Service
 */
export function convertToContent(
    namespace: string,
    template: ITemplate,
    componentParameters: ITemplateComponentParameters[]
): IContentTemplate {
    return {
        "type": "template",
        template: {
            namespace,
            name: template.name,
            language: {
                policy: "deterministic",
                code: template.language
            },
            components: componentParameters
        }
    };
}
