import { createContext, useEffect, useState } from "react";
import { FriendOBJ } from "../models/models";
import Routes from "../config";
export interface UserContextOBJ {
    uuid: string;
    username: string;
    avatar: string;
    accessToken: string;
    setUuid:React.Dispatch<React.SetStateAction<string>>;
    setUsername:React.Dispatch<React.SetStateAction<string>>;
    setAvatar:React.Dispatch<React.SetStateAction<string>>;
    setAccessToken:React.Dispatch<React.SetStateAction<string>>;
    friends: Map<String,FriendOBJ>;
	setFriends: React.Dispatch<React.SetStateAction<Map<String, FriendOBJ>>>
}

export const UserContext = createContext<UserContextOBJ>(undefined!);

function UserCTX({ children }: { children: React.ReactChild }) {
    const [uuid, setUuid] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [avatar, setAvatar] = useState<string>("");
    const [accessToken, setAccessToken] = useState<string>("");
	let [friends, setFriends] = useState<Map<String,FriendOBJ>>(new Map<String,FriendOBJ>());

    useEffect(() => {
        const token = localStorage.getItem("access_token") || "";
        if (token !== "") {
            fetch(Routes.currentUser, {
                method: "GET",
                headers: {
                    "Authorization": token
                }
            }).then(response => {
                if (response.status === 200) {
                    response.json().then(user => {
                        setUuid(user.uuid);
                        setUsername(user.username);
                        setAvatar(user.avatar);
                        setAccessToken(token);
                    });
                } else {
                    localStorage.removeItem("access_token");
                    window.location.href = "/";
                }
            })
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
        setAccessToken: setAccessToken,
        friends: friends,
        setFriends: setFriends
    }
    
    return (
    <UserContext.Provider value={context_value}>
        {children}
    </UserContext.Provider>
    )
}

export default UserCTX;