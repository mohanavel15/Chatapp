import Routes from "../config";

export async function AddFriend(access_token: string, friend_id: string) {
    const response = await fetch(Routes.Friends, {
        method: "POST",
        headers: {
            "Authorization": access_token,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "to": friend_id
        })
    })
    return response;
}

export async function DeleteFriend(access_token: string, friend_id: string) {
    const url = Routes.Friends + "/" + friend_id;
    const response = await fetch(url, {
        method: "DELETE",
        headers: {
            "Authorization": access_token,
        }
    })
    return response;
}