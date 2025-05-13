import { ITemplateComponentParameters } from "@models/whats-app-template";

export enum AuthorTypes {
    User = "user",
    Business = "business"
}

export interface IAuthor {
    /**
     * The type of the author
     */
    type: AuthorTypes;
    /**
     * The id of the user. Only supported when type is user.
     */
    userId?: string;
    /**
     * The externalId of the user. Only supported when type is user.
     */
    userExternalId?: string;
    /**
     * The display name of the message author.
     */
    displayName?: string;
    /**
     * A custom message icon url. The image must be in either JPG, PNG, or GIF format
     */
    avatarUrl?: string;
}

export enum Capabilities {
    Text = "text",
    Image = "image",
    File = "file",
    Link = "link",
    Reply = "reply",
    Postback = "postback",
    Extension = "webview",
    Location = "location",
    LocationRequest = "locationRequest",
    ConversationRead = "conversation:read",
    TypingStart = "typing:start",
    TypingStop = "typing:stop",
    Carousel = "carousel",
    Form = "form",
    FormResponse = "formResponse",
    List = "list",
    Compound = "compound"
}

export type IContent = IContentCarousel | IContentImage | IContentText | IContentTemplate;

type MetadataValue = string | number | boolean;

export type IMetadata = Record<string, MetadataValue | undefined>;

export type IAction =
    | IBuyAction
    | ILinkAction
    | ILocationRequestAction
    | IPostbackAction
    | IReplyAction
    | IWebviewAction;

export { IBuyAction, ILinkAction, ILocationRequestAction, IPostbackAction, IReplyAction, IWebviewAction };

interface IBaseAction {
    /**
     * The button text.
     * Text longer than 20 characters will be truncated on Facebook Messenger,
     * and longer than 40 characters will be truncated on Web Messenger, iOS, and Android.
     */
    text: string;
    /**
     * Flat object containing custom properties.
     */
    metadata?: IMetadata;
}

interface IBuyAction extends IBaseAction {
    /**
     * The type of action
     */
    type: "buy";
    /**
     * The amount being charged.
     * It needs to be specified in cents and is an integer (9.99$ -> 999).
     */
    amount: number;
    /**
     * An ISO 4217 standard currency code in lowercase. Used for actions of type buy.
     */
    currency?: string;
}

interface ILinkAction extends IBaseAction {
    /**
     * The type of action
     */
    type: "link";
    /**
     * The action URI. This is the link that will be used in the clients when clicking the button.
     */
    uri: string;
    /**
     * Boolean value indicating whether the action is
     * the default action for a message item in Facebook Messenger.
     */
    default?: boolean;
    /**
     * Extra options to pass directly to the channel API.
     */
    extraChannelOptions?: {
        /**
         * Messenger channel options.
         */
        messenger?: {
            /**
             * For webview type actions,
             * a boolean value indicating whether the URL should be loaded
             * with Messenger Extensions enabled.
             * Default: false
             */
            messenger_extensions?: boolean;
            /**
             * For webview type actions, a string value indicating
             * if the share button should be hidden.
             */
            webview_share_button?: "hide";
        };
    };
}

interface ILocationRequestAction extends IBaseAction {
    /**
     * The type of action
     */
    type: "locationRequest";
}

interface IPostbackAction extends IBaseAction {
    /**
     * The type of action
     */
    type: "postback";
    /**
     * The payload of a postback or reply button.
     */
    payload: string;
}

interface IReplyAction extends IBaseAction {
    /**
     * The type of action
     */
    type: "reply";
    /**
     * A string payload to help you identify the action context.
     * Used when posting the reply. You can also use metadata for more complex needs.
     */
    payload: string;
    /**
     * An icon to render next to the reply option.
     */
    iconUrl?: string;
}

interface IWebviewAction extends IBaseAction {
    /**
     * The type of action
     */
    type: "webview";
    /**
     * The action URI. This is the link that will be used in the clients when clicking the button.
     */
    uri: string;
    /**
     * The fallback uri for channels that don’t support webviews. Used for actions of type webview.
     */
    fallback: string;
    /**
     * Boolean value indicating whether the action is the default action
     * for a message item in Facebook Messenger.
     */
    default?: boolean;
    /**
     * Extra options to pass directly to the channel API.
     */
    extraChannelOptions?: {
        /**
         * Messenger channel options.
         */
        messenger?: {
            /**
             * For webview type actions,
             * a boolean value indicating whether the URL should be
             * loaded with Messenger Extensions enabled.
             * Default: false
             */
            messenger_extensions?: boolean;
            /**
             * For webview type actions,
             * a string value indicating if the share button should be hidden.
             */
            webview_share_button?: "hide";
        };
    };
    /**
     * The size to display a webview. Used for actions of type webview.
     */
    size?: "compact" | "tall" | "full";
    /**
     * Boolean value indicating if the webview should open automatically.
     * Only one action per message can be set to true.
     * Currently only supported on the Web Messenger.
     */
    openOnReceive?: boolean;
}

export interface IItem {
    /**
     * The title of the item
     */
    title: string;
    /**
     * The description of the item
     */
    description?: string;
    /**
     * The size of the item
     */
    size?: "compact" | "large";
    /**
     * The MIME type for image attached
     */
    mediaType?: string;
    /**
     * The URL for media, such as an image, attached to the message.
     */
    mediaUrl?: string;
    /**
     * Optional description.
     */
    altText?: string;
    /**
     * Array of message actions.
     */
    actions: IAction[];
    /**
     * Flat object containing custom properties.
     */
    metadata?: IMetadata;
}

export interface IContentCarousel {
    /**
     * The type of message
     */
    type: Capabilities.Carousel;
    /**
     * Fallback text message used when carousel messages are not supported by the channel
     */
    text?: string;
    /**
     * The items contained within a carousel message
     */
    items: IItem[];
    /**
     * setting to adjust the carousel layout
     */
    displaySettings?: {
        imageAspectRatio: "horizontal" | "square";
    };
}

export interface IContentImage {
    /**
     * The type of message
     */
    type: Capabilities.Image;
    /**
     * The URL for media, such as an image, attached to the message.
     */
    mediaUrl: string;
    /**
     * An optional description of the file for accessibility purposes.
     * Need to be under or equal to 128 characters.
     * The field will be saved by default with the file name as the value.
     */
    altText?: string;
    /**
     * The text content of the message.
     */
    text?: string;
    /**
     * Array of message actions.
     */
    actions?: IAction[];
}

export interface IContentFile {
    /**
     * The type of message
     */
    type: Capabilities.File;
    /**
     * The URL for media, such as an image, attached to the message.
     */
    mediaUrl: string;
    /**
     * An optional description of the file for accessibility purposes.
     * Need to be under or equal to 128 characters.
     * The field will be saved by default with the file name as the value.
     */
    altText?: string;
    /**
     * The text content of the message.
     */
    text?: string;
}

interface Text {
    /**
     * The text content of the message. Optional only if actions are provided.
     */
    text: string;
}

export interface IContentText extends Text {
    /**
     * The type of message.
     */
    type: Capabilities.Text;
    /**
     * The payload of a reply button response message.
     */
    payload?: string;
    /**
     * Array of message actions.
     */
    actions?: IAction[];
}

export interface IContentTemplate {
    "type": "template";
    template: {
        /**
         * Name of the template
         */
        name: string;
        /**
         * Language setting, for WhatsApp only
         */
        language?: {
            policy: "deterministic";
            /**
             * Language code. i.e. "en" for English
             */
            code: string;
        };
        /**
         * Template parameters, for WhatsApp only
         */
        components?: ITemplateComponentParameters[];
    };
}

/**
 * Enum consisting of all the supported user channels
 */
export enum UserChannelTypes {
    Web = "web",
    WhatsApp = "whatsapp",
    Instagram = "instagram",
    iOS = "ios",
    Twitter = "twitter",
    Messenger = "messenger",
    Twilio = "twilio",
    MessageBirds = "messagebird",
    Telegram = "telegram",
    Android = "android"
}

export interface IIntegrationsResponse {
    integrations: IIntegration[];
    meta: {
        hasMore: boolean;
    };
}

export interface IServiceConfig {
    /**
     * Authorization token for Sunshine Conversation API
     */
    authorizationToken: string;
    /**
     * Application ID of Sunshine Conversation
     */
    appId: string;
    useSecure: boolean;
    /**
     * Author to use when sending a message
     */
    author: IAuthor;
}

export interface ISendNotificationPayload {
    destination?: {
        integrationId: string;
        destinationId: string;
    };
    author: {
        role: "appMaker";
    };
    message: IContent;
    messageSchema?: UserChannelTypes;
    metadata?: IMetadata;
}

export interface ISendNotification {
    notification: { _id: string };
}

// ====

/**
 * Integration installed inside a Sunshine Conversation application
 */
export type IIntegration =
    | IIntegrationAndroid
    | IIntegrationInstagram
    | IIntegrationIos
    | IIntegrationMessageBirds
    | IIntegrationMessenger
    | IIntegrationTwilio
    | IIntegrationTwitter
    | IIntegrationWeb
    | IIntegrationWhatsApp
    | IIntegrationTelegram;

interface IIntegrationBase {
    id: string;
    type: UserChannelTypes;
    status: string;
    /**
     * A human-friendly name used to identify the integration up to 100 characters.
     */
    displayName: string | null;
}

export interface IIntegrationAndroid extends IIntegrationBase {
    type: UserChannelTypes.Android;
    /**
     * Your sender id from the fcm console.
     */
    senderId: string;
    /**
     * Allows users to create more than one conversation on the android integration.
     */
    canUserCreateMoreConversations: boolean;
    /**
     * Allows users to send attachments. By default, the setting is set to true. This setting can only be configured in Zendesk Admin Center.
     */
    attachmentsEnabled: boolean;
}

export interface IIntegrationInstagram extends IIntegrationBase {
    type: UserChannelTypes.Instagram;
    /**
     * Your Facebook App ID.
     */
    appId: string;
    /**
     * Your Instagram Business account name
     */
    businessName?: string;
    /**
     * Your Instagram Business unique username
     */
    businessUsername?: string;
    /**
     * The ID of the Facebook Page linked to your Instagram Business account
     */
    pageId?: string;
    /**
     * The ID of the Instagram Business account
     */
    businessId?: string;
    /**
     * The Facebook user's username. This is returned when integrating through the Dashboard
     */
    username?: string;
    /**
     * The Facebook user's user ID. This is returned when integrating through the Dashboard
     */
    userId?: string;
}

export interface IIntegrationIos extends IIntegrationBase {
    type: UserChannelTypes.iOS;
    /**
     * The APN environment to connect to (Production, if true, or Sandbox). Defaults to value inferred from certificate if not specified.
     */
    production?: boolean;
    /**
     * Use the unread count of the conversation as the application badge.
     */
    autoUpdateBadge?: boolean;
    /**
     * Allows users to create more than one conversation on the iOS integration.
     */
    canUserCreateMoreConversations?: boolean;
    /**
     * Allows users to send attachments. By default, the setting is set to true. This setting can only be configured in Zendesk Admin Center.
     */
    attachmentsEnabled?: boolean;
}

export interface IIntegrationMessageBirds extends IIntegrationBase {
    type: UserChannelTypes.MessageBirds;
    /**
     * Sunshine Conversations will receive all messages sent to this phone number.
     */
    originator: string;
    /**
     * The secret that is used to configure webhooks in MessageBird.
     */
    webhookSecret: string;
}

export interface IIntegrationMessenger extends IIntegrationBase {
    type: UserChannelTypes.Messenger;
    /**
     * A Facebook Page Access Token.
     */
    pageAccessToken: string;
    /**
     * A Facebook App ID.
     */
    appId: string;
    /**
     * A Facebook page ID.
     */
    pageId?: number;
    /**
     * A Facebook page name.
     */
    pageName?: string;
}

export interface IIntegrationTwilio extends IIntegrationBase {
    type: UserChannelTypes.Twilio;
    phoneNumber: string;
}

export interface IIntegrationTwilioTalk extends IIntegrationTwilio {
    sms: boolean;
    mms: boolean;
}

export interface IIntegrationSuncoTwilio extends IIntegrationTwilio {
    /**
     * Twilio Account SID.
     */
    accountSid: string;
    /**
     * SID for specific phone number. One of messagingServiceSid or phoneNumberSid must be provided when creating a Twilio integration
     */
    phoneNumberSid: string;
    /**
     * SID for specific messaging service. One of messagingServiceSid or phoneNumberSid must be provided when creating a Twilio integration.
     */
    messagingServiceSid: string;
}

export interface IIntegrationTwitter extends IIntegrationBase {
    type: UserChannelTypes.Twitter;
    /**
     * Your Twitter app's tier. Only "enterprise" is supported for new integrations.
     */
    tier: string;
    /**
     * The Twitter dev environments label. Only required / used for sandbox and premium tiers.
     */
    envName: string;
}

export interface IIntegrationWeb extends IIntegrationBase {
    type: UserChannelTypes.Web;
    /**
     * This color will be used in the messenger header and the button or tab in idle state.
     * Must be a 3 or 6-character hexadecimal color.
     * Default: "65758e".
     */
    brandColor?: string;
    /**
     * When true, the introduction pane will be pinned at the top of the conversation instead of scrolling with it.
     * Default: false.
     */
    fixedIntroPane?: boolean;
    /**
     * This color will be used for customer messages, quick replies and actions in the footer.
     * Must be a 3 or 6-character hexadecimal color.
     * Default: "0099ff".
     */
    conversationColor?: string;
    /**
     * This color will be used for call-to-actions inside your messages.
     * Must be a 3 or 6-character hexadecimal color.
     * Default: "0099ff".
     */
    actionColor?: string;
    /**
     * Choose how the messenger will appear on your website. Must be either 'button' or 'tab'.
     */
    displayStyle: "button" | "tab";
    /**
     * With the button style Web Messenger, you have the option of selecting your own button icon.
     * The image must be at least 200 x 200 pixels and must be in either JPG, PNG, or GIF format.
     * Can be null.
     */
    buttonIconUrl: string | null;
    /**
     * With the button style Web Messenger, you have the option of specifying the button width.
     * Default: "58".
     */
    buttonWidth?: string;
    /**
     * With the button style Web Messenger, you have the option of specifying the button height.
     * Default: "58".
     */
    buttonHeight?: string;
    /**
     * Array of integration IDs, order will be reflected in the Web Messenger. When set, only integrations from this list will be displayed in the Web Messenger.
     * If unset, all integrations will be displayed.
     * Can be null.
     */
    integrationOrder: string[] | null;
    /**
     * A custom business name for the Web Messenger.
     */
    businessName: string;
    /**
     * A custom business icon url for the Web Messenger.
     * The image must be at least 200 x 200 pixels and must be in either JPG, PNG, or GIF format.
     */
    businessIconUrl: string;
    /**
     * A background image url for the conversation. Image will be tiled to fit the window.
     */
    backgroundImageUrl: string;
    /**
     * A list of origins to whitelist. When set, only the origins from this list will be able to initialize the Web Messenger. If unset, all origins are whitelisted. The elements in the list should follow the serialized-origin format from RFC 6454: scheme "://" host [ ":" port ], where scheme is http or https.
     * Can be null.
     */
    originWhitelist: string[] | null;
    /**
     * Allows users to view their list of conversations. By default, the list of conversations will be visible.
     * This setting only applies to apps where settings.multiConvoEnabled is set to true.
     */
    canUserSeeConversationList: boolean;
    /**
     * Allows users to create more than one conversation on the web messenger integration.
     */
    canUserCreateMoreConversations: boolean;
    /**
     * Allows users to send attachments. By default, the setting is set to true. This setting can only be configured in Zendesk Admin Center.
     */
    attachmentsEnabled: boolean;
}

export interface IIntegrationWhatsApp extends IIntegrationBase {
    type: UserChannelTypes.WhatsApp;
    /**
     * The Id of the deployment. The integrationId and the appId will be added to the deployment.
     * Additionally, the deployment’s status will be set to integrated.
     */
    deploymentId: string;
    /**
     * Specify a fallback language to use when sending WhatsApp message template using the short hand syntax.
     * Defaults to en_US.
     * See WhatsApp documentation for more info.
     */
    hsmFallbackLanguage: string | null;
    /**
     * The business ID associated with the WhatsApp account. In combination with accountManagementAccessToken, it’s used for Message Template Reconstruction.
     */
    accountId: string | null;
    /**
     * The phone number that is associated with the deployment of this integration, if one exists.
     */
    phoneNumber: string | null;
    /**
     * An access token associated with the accountId used to query the WhatsApp Account Management API.
     * In combination with accountId, it’s used for Message Template Reconstruction.
     */
    accountManagementAccessToken: string | null;
}

export interface IIntegrationTelegram extends IIntegrationBase {
    type: UserChannelTypes.Telegram;
    /**
     * Username of the botId
     */
    username: string;
    /**
     * A human-friendly name used to identify the integration.
     */
    botId: string;
}

export interface ISunshineConversationError {
    readyState: number;
    responseText: string;
    responseJSON: {
        error: {
            /**
             * Code error
             * ex: bad_request
             */
            code: string;
            /**
             * Error description
             */
            description: string;
        };
    };
    /**
     * Status Http error
     */
    status: number;
    /**
     * Status error text
     */
    statusText: string;
}

export interface ISunshineConversationPageParameters {
    /**
     * A record id. Results will only contain the records that come after the specified record.
     * Only one of after or before can be provided, not both.
     */
    after?: string;
    /**
     * A record id. Results will only contain the records that come before the specified record.
     * Only one of after or before can be provided, not both.
     */
    before?: string;
    /**
     * Default: 25
     * The number of records to return. Does not apply to the listMessages endpoint.
     */
    size?: number;
}

export interface ISunshineConversationGetIntegrationsFilters {
    /**
     * Comma-separated list of types to return. If omitted, all types are returned.
     */
    types: string;
}
