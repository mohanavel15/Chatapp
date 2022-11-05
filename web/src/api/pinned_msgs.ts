import Routes from "../config";
import { MessageOBJ } from "../models/models";

export async function GetPinnedMessages(channel_id: string) {
    const url = Routes.Channels+`/${channel_id}/pins`
    const response = await fetch(url);
    if (!response.ok) {
        return [] as MessageOBJ[];
    }

    const messages: MessageOBJ[] = await response.json();
    return messages;
}