export enum TemplateStatus {
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    PENDING = "PENDING"
}

export interface ITemplate {
    id: string;
    name: string;
    components: ITemplateComponent[];
    message: any;
    language: string;
    status: TemplateStatus;
    category: string;
}

export interface ICreateTemplate {
    name: string;
    language: string;
    category: string;
    components: ITemplateComponent[];
}

export enum TemplateComponentTypes {
    header = "HEADER",
    body = "BODY",
    buttons = "BUTTONS",
    // When we receive a template it's buttonS but when we send a template we need to use button.
    button = "BUTTON",
    footer = "FOOTER"
}

export type ITemplateComponent =
    | ITemplateHeaderComponent
    | ITemplateBodyComponent
    | ITemplateButtonComponent
    | ITemplateFooterComponent;

interface ITemplateComponentBase {
    "type": TemplateComponentTypes;
}

interface ITemplateTextNamedParams {
    param_name: string;
    example: string;
}

export interface ITemplateBodyComponent extends ITemplateComponentBase {
    "type": TemplateComponentTypes.body;
    text: string;
    // Only provided if the `text` contain variables.
    example?: {
        // Contains the sample values of all the variable.
        // All the sample values are stored in the first array.
        // Example: body_text: [["another", "sample"]]
        body_text?: string[][];
        // Contains the sample values of the named variables.
        // The key is the name of the variable and the value is the sample value.
        // Example: body_text_named_params: [{param_name: "name", example: "sample"}]
        body_text_named_params?: ITemplateTextNamedParams[];
        // Depending on the way of creation of the template, the `body_text` or `body_text_named_params` will be provided.
    };
}

export enum TemplateComponentHeaderFormat {
    text = "TEXT",
    image = "IMAGE",
    document = "DOCUMENT",
    video = "VIDEO"
}

export type ITemplateHeaderComponent = ITemplateTextHeaderComponent | ITemplateMediaHeaderComponent;

interface ITemplateHeaderComponentBase extends ITemplateComponentBase {
    "type": TemplateComponentTypes.header;
    format: TemplateComponentHeaderFormat;
}

export interface ITemplateTextHeaderComponent extends ITemplateHeaderComponentBase {
    format: TemplateComponentHeaderFormat.text;
    text: string;
    example?: {
        // Contains the sample value of a variable (max: 1)
        header_text?: string[];
        header_text_named_params?: ITemplateTextNamedParams[];
        // Depending on the way of creation of the template, the `header_text` or `header_text_named_params` will be provided.
    };
}

export interface ITemplateMediaHeaderComponent extends ITemplateHeaderComponentBase {
    format:
        | TemplateComponentHeaderFormat.image
        | TemplateComponentHeaderFormat.document
        | TemplateComponentHeaderFormat.video;
    example: {
        // Contains an URL (max: 1)
        header_handle: string[];
    };
}

export enum TemplateComponentButtonTypes {
    quickReply = "QUICK_REPLY",
    url = "URL",
    phoneNumber = "PHONE_NUMBER"
}

export interface ITemplateButtonComponent extends ITemplateComponentBase {
    "type": TemplateComponentTypes.buttons;
    buttons: ITemplateButton[];
}

export type ITemplateButton = ITemplateButtonPhoneNumber | ITemplateButtonUrl | ITemplateButtonQuickReply;

interface ITemplateButtonBase {
    "type": TemplateComponentButtonTypes;
    text: string;
}

export interface ITemplateButtonPhoneNumber extends ITemplateButtonBase {
    "type": TemplateComponentButtonTypes.phoneNumber;
    phoneNumber: string;
}

export interface ITemplateButtonUrl extends ITemplateButtonBase {
    "type": TemplateComponentButtonTypes.url;
    // A variable (`{{1}}`) is accepted at the end of the URL
    url: string;
    // Contains a sample value of the url if a variable is present (max: 1)
    example?: string[];
}

export interface ITemplateButtonQuickReply extends ITemplateButtonBase {
    "type": TemplateComponentButtonTypes.quickReply;
}

export interface ITemplateFooterComponent extends ITemplateComponentBase {
    "type": TemplateComponentTypes.footer;
    text: string;
}

export interface ITemplatesResponse {
    messageTemplates?: ITemplate[];
    before?: string;
    after?: string;
}

export interface IResponse<T> {
    responseJSON: T;
}

export interface IMessageTemplate extends ICreateTemplate {
    messageTemplate: { status: TemplateStatus; id: string };
}

export type ITemplateComponentParameters = ITemplateBaseComponentParameters | ITemplateButtonComponentParameters;

export interface ITemplateBaseComponentParameters {
    "type": TemplateComponentTypes;
    parameters: ITemplateParameter[];
}

export interface ITemplateButtonComponentParameters extends ITemplateBaseComponentParameters {
    "type": TemplateComponentTypes.button;
    index: number;
    sub_type: TemplateComponentButtonTypes;
}

export type ITemplateParameter =
    | ITemplateTextParameter
    | ITemplateImageParameter
    | ITemplateVideoParameter
    | ITemplateDocumentParameter;

interface ITemplateParameterBase {
    type: string;
}

export interface ITemplateTextParameter extends ITemplateParameterBase {
    type: "text";
    parameter_name?: string;
    text: string;
}

/**
 * Accepted format image/jpeg, image/png
 * Size limit: 5MB
 *
 * Supported types : https://developers.facebook.com/docs/whatsapp/cloud-api/reference/media#supported-media-types
 */
export interface ITemplateImageParameter extends ITemplateParameterBase {
    type: "image";
    image: {
        link: string;
        provider?: {
            name: string;
        };
    };
}

/**
 * Accepted format video/mp4, video/3gp
 * Size limit: 16MB
 *
 * Supported types : https://developers.facebook.com/docs/whatsapp/cloud-api/reference/media#supported-media-types
 */
export interface ITemplateVideoParameter extends ITemplateParameterBase {
    type: "video";
    video: {
        link: string;
        provider?: {
            name: string;
        };
    };
}

/**
 * Accepted format text/plain, application/pdf, application/vnd.ms-powerpoint, application/msword, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.openxmlformats-officedocument.presentationml.presentation, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
 * Size limit: 100MB
 *
 * More information: https://developers.facebook.com/docs/whatsapp/cloud-api/reference/media#supported-media-types
 */
export interface ITemplateDocumentParameter extends ITemplateParameterBase {
    type: "document";
    document: {
        link: string;
        provider?: {
            name: string;
        };
        filename?: string;
    };
}
