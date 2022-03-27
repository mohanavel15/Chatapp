import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { UserOBJ } from "../models/models";
export interface UserContextOBJ {
    uuid: string;
    username: string;
    avatar: string;
    accessToken: string;
    setUuid:React.Dispatch<React.SetStateAction<string>>;
    setUsername:React.Dispatch<React.SetStateAction<string>>;
    setAvatar:React.Dispatch<React.SetStateAction<string>>;
    setAccessToken:React.Dispatch<React.SetStateAction<string>>;
}

export const UserContext = createContext<UserContextOBJ>(undefined!);

function UserCTX({ children }: { children: React.ReactChild }) {

    const [uuid, setUuid] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [avatar, setAvatar] = useState<string>("");
    const [accessToken, setAccessToken] = useState<string>("");

    useEffect(() => {
        const token = localStorage.getItem("access_token") || "";

        if (token !== "") {
            axios.get<UserOBJ>("http://127.0.0.1:5000/users/@me", {
                headers: {
                    "Authorization": token
                }
            }).then(res => {
                if (res.status === 200) {
                    const user = res.data;
                    setUuid(user.uuid);
                    setUsername(user.username);
                    setAvatar(user.avatar);
                    setAccessToken(token);
                } else {
                    localStorage.removeItem("access_token");
                    window.location.href = "/";
                }
            }).catch(err => {
                console.log(err);
            });
        } else {
            window.location.href = "/";
        }
    }, []);

    const context_value: UserContextOBJ = {
        uuid: uuid,
        username: username,
        avatar: avatar,
        accessToken: accessToken,
        setUuid: setUuid,
        setUsername: setUsername,
        setAvatar: setAvatar,
        setAccessToken: setAccessToken
    }
    
    
    return (
    <UserContext.Provider value={context_value}>
        {children}
    </UserContext.Provider>
    )
}

export default UserCTX;