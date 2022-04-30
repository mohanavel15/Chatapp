import Routes from "../config";

async function Refresh(): Promise<string | undefined> {
    const access_token = localStorage.getItem('access_token');
    const client_token = localStorage.getItem('client_token');

    if (access_token == null || client_token == null) {
        return undefined;
    }

    const response = await fetch(Routes.refresh, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            access_token: access_token,
            client_token: client_token
        })
    })

    if (response.status === 200) {
        const tokens = await response.json()
        localStorage.setItem('access_token', tokens.access_token);
        localStorage.setItem('client_token', tokens.client_token);
        return tokens.access_token;
    } else if (response.status === 204) {
        return access_token;
    } else {
        return undefined;
    }
}

async function AddFriend(access_token: string, friend_id: string) {
    const response = fetch(Routes.Friends, {
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

function DeleteFriend(access_token: string, friend_id: string) {
    const url = Routes.Friends + "/" + friend_id;
    const response = fetch(url, {
        method: "DELETE",
        headers: {
            "Authorization": access_token,
        }
    })
    return response;
}

function BlockUser(access_token: string, user_id: string) {
    const response = fetch(Routes.Blocks, {
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

function UnBlock(access_token: string, user_id: string) {
    const url = Routes.Blocks + "/" + user_id; 
    const response = fetch(url, {
        method: "DELETE",
        headers: {
            "Authorization": access_token,
        }
    })
    return response;
}

export { Refresh, AddFriend, DeleteFriend, BlockUser, UnBlock };