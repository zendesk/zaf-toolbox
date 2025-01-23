import {
    ITemplate,
    ITemplateComponentParameters,
    TemplateComponentTypes,
    TemplateStatus
} from "@models/whats-app-template";
import { convertToContent } from "@utils/whats-app-helper";

describe("WhatsAppHelper", () => {
    describe("convertToContent", () => {
        const templateSample: ITemplate = {
            id: "id",
            name: "name",
            components: [],
            message: "message",
            language: "fr",
            status: TemplateStatus.APPROVED,
            category: "category"
        };
        const componentParametersSample: ITemplateComponentParameters[] = [
            {
                "type": TemplateComponentTypes.body,
                parameters: [{ "type": "text", text: "sample" }]
            }
        ];

        it("should return a valid IContentTemplate", () => {
            const content = convertToContent(templateSample, componentParametersSample);

            expect(content).toStrictEqual({
                "type": "template",
                template: {
                    name: templateSample.name,
                    language: {
                        policy: "deterministic",
                        code: templateSample.language
                    },
                    components: componentParametersSample
                }
            });
        });
    });
});
