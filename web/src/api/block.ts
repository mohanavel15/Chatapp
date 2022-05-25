import Routes from "../config";

export async function BlockUser(access_token: string, user_id: string) {
    const response = await fetch(Routes.Blocks, {
        method: "POST",
        headers: {
            "Authorization": access_token,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "uuid": user_id
        })
    })
    return response;
}

export async function UnBlock(access_token: string, user_id: string) {
    const url = Routes.Blocks + "/" + user_id; 
    const response = await fetch(url, {
        method: "DELETE",
        headers: {
            "Authorization": access_token,
        }
    })
    return response;
}