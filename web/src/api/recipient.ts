import Routes from "../config";

export async function AddRecipient(channel_id: string, recipient_id: string) {
    const url = Routes.Channels+"/"+channel_id+"/recipients/"+recipient_id;
    const response = await fetch(url, { method: "PUT" })
    return response;
}

export async function RemoveRecipient(channel_id: string, recipient_id: string, reason: string, isBan: boolean) {
    const url = Routes.Channels+"/"+channel_id+"/recipients/"+recipient_id;
    const response = await fetch(url, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ reason: reason, isban: isBan })
    })
    return response;
}