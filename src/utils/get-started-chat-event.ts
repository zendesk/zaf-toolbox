import { NotFoundError } from "@errors/not-found-error";
import { IAuditEvent, IAuditResponse } from "@models/index";
import { Client } from "@zendesk/sell-zaf-app-toolbox";

/**
 * Get the chat started event from the ticket audits
 *
 * @throws NotFoundError if the chat started event is not found or the ticket audit is not exist.
 */
export async function getStartedChatEvent(client: Client, ticketId: number): Promise<IAuditEvent> {
    const settings = {
        url: `/api/v2/tickets/${ticketId}/audits.json`,
        type: "GET"
    };

    const { audits } = await client.request<unknown, IAuditResponse>(settings);

    if (!audits) {
        throw new NotFoundError("Failed to get audits");
    }

    for (const { events } of audits) {
        const chatStartedeventEvent = events.find((event) => event.type === "ChatStartedEvent");
        if (!chatStartedeventEvent?.value) {
            continue;
        }

        return chatStartedeventEvent;
    }

    throw new NotFoundError("Failed to retrieve chat started event");
}
