import Routes from "../config";

export async function RemoveRecipient(access_token: string, channel_id: string, recipient_id: string, reason: string, isBan: boolean) {
    const url = Routes.Channels+"/"+channel_id+"/recipients/"+recipient_id;
    const response = await fetch(url, {
        method: "DELETE",
        headers: {
            "Authorization": access_token,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ reason: reason, isban: isBan })
    })
    return response;
}