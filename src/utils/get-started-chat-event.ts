import { NotFoundError } from "@errors/not-found-error";
import { IAuditEvent, IAuditResponse } from "@models/index";
import { IClient } from "@models/zaf-client";

/**
 * Get the chat started event from the ticket audits
 *
 * @throws NotFoundError if the chat started event is not found or the ticket audit is not exist.
 */
export async function getStartedChatEvent(client: IClient, ticketId: number): Promise<IAuditEvent> {
    const { audits } = await client.request<IAuditResponse>({
        url: `/api/v2/tickets/${ticketId}/audits.json`,
        type: "GET"
    });

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
