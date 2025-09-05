import { IZendeskUser } from "@models/zendesk-user";

export interface IGroup {
    id: number;
    name: string;
}

export interface IAssignee {
    group: IGroup;
    user: IZendeskUser;
}

export interface ITicketCustomField {
    id: string;
    value: string;
}

export type ICustomFields = Record<string, ITicketCustomField>;

export interface ITicketField {
    active: boolean;
    agent_description: string;
    collapsed_for_agents: boolean;
    created_at: string;
    description: string;
    editable_in_portal: boolean;
    id: number;
    position: number;
    raw_description: string;
    raw_title: string;
    raw_title_in_portal: string;
    required: boolean;
    required_in_portal: boolean;
    tag: string;
    title: string;
    title_in_portal: string;
    type: string;
    updated_at: string;
    url: string;
    visible_in_portal: boolean;
}

export interface ITicketFieldResponse {
    ticket_fields: ITicketField[];
}

interface IZendeskTicketComment {
    body?: string;
    public?: boolean;
    html_body?: string;
}

interface IZendeskTicketEmailCc {
    user_id?: number;
    email?: string;
    action?: "add" | "remove";
}

export interface IZendeskTicket {
    allow_attachments?: boolean; // default true, agents can add attachments to comment
    allow_channelback?: boolean;
    assignee_email?: string;
    assignee_id?: number;
    attribute_value_ids?: number[];
    brand_id?: number;
    collaborator_ids?: number[];
    collaborators?: { id?: number; email?: string }[];
    comment?: IZendeskTicketComment;
    custom_fields?: ITicketField[];
    custom_status_id?: number;
    due_at?: string; // ISO 8601 string date
    email_cc_ids?: number[];
    email_ccs?: IZendeskTicketEmailCc[];
    external_id?: string;
    group_id?: number;
    macro_id?: number;
    macro_ids?: number[];
    metadata?: Record<string, any>; // write only metadata object
    organization_id?: number;
    priority?: "urgent" | "high" | "normal" | "low";
    problem_id?: number;
    raw_subject?: string;
    recipient?: string;
    requester?: {
        name?: string;
        email?: string;
    };
    requester_id?: number; // mandatory on create
    safe_update?: boolean;
    sharing_agreement_ids?: number[];
    status?: "new" | "open" | "pending" | "hold" | "solved" | "closed";
    subject?: string;
    submitter_id?: number;
    tags?: string[];
    ticket_form_id?: number;
    type?: "problem" | "incident" | "question" | "task";
    via_followup_source_id?: number;

    id: number;
    created_at: string;
    updated_at: string;
    url: string;
    is_public: boolean;
}

export interface IZendeskTicketCreateRequest {
    ticket: IZendeskTicket;
}
