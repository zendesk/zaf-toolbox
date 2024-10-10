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
