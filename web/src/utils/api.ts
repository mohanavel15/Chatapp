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

export { Refresh };