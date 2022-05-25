import Routes from "../config";

export async function CreateChannel(access_token: string, name: string, icon: string) {
    const url = Routes.currentUser+"/channels";
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": access_token,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: name, icon: icon })
    })
    return response;
}

export async function EditChannel(access_token: string, channel_id: string, name: string, icon: string) {
    const url = Routes.Channels+"/"+channel_id;
    const response = await fetch(url, {
        method: "PATCH",
        headers: {
            "Authorization": access_token,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: name, icon: icon })
    })
    return response;
}

export async function DeleteChannel(access_token: string, channel_id: string) {
    const url = Routes.Channels+"/"+channel_id;
    const response = await fetch(url, {
        method: "DELETE",
        headers: {
            "Authorization": access_token,
        }
    })
    return response;
}