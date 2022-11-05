import Routes from "../config";
import { ChannelOBJ } from "../models/models";

export async function GetChannels() {
    const response = await fetch(Routes.Channels);
    if (!response.ok) {
        return [] as ChannelOBJ[];
    }

    const channels: ChannelOBJ[] = await response.json();
    return channels;
}

export async function CreateChannel(name: string, icon: string | ArrayBuffer | null) {
    const url = Routes.currentUser+"/channels";
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: name, icon: icon })
    })

    if (!response.ok) {
        return {} as ChannelOBJ;
    }

    const channel_: ChannelOBJ = await response.json();
    return channel_;
}

export async function EditChannel(channel_id: string, name: string, icon: string) {
    const url = Routes.Channels+"/"+channel_id;
    const response = await fetch(url, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: name, icon: icon })
    })
    return response;
}

export async function DeleteChannel(channel_id: string) {
    const url = Routes.Channels+"/"+channel_id;
    const response = await fetch(url, {
        method: "DELETE",
    })
    return response;
}

export async function GetDMChannel(user_id: string) {
    const url = Routes.currentUser+"/channels"
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ recipient_id: user_id })
    })
    return response;
}