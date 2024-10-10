import { UserChannelTypes } from "@models/index";

export interface IAuditEvent {
    id: number;
    type: string;
    value?: {
        conversation_id: string;
        channel: UserChannelTypes;
    };
}

export interface IAudit {
    id: number;
    ticket_id: number;
    created_at: string;
    author_id: number;
    events: IAuditEvent[];
}

export interface IAuditResponse {
    audits: IAudit[];
    count: number;
}
