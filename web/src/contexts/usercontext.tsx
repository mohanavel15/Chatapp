import { createContext, useEffect, useState } from "react";
import { FriendOBJ, UserOBJ } from "../models/models";
import useMap from '../hooks/useMap';
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
	setFriend: React.Dispatch<React.SetStateAction<Map<String, FriendOBJ>>>
    deleteFriend: (key: String) => void
    blocked: Map<String,UserOBJ>;
	setBlocked: React.Dispatch<React.SetStateAction<Map<String, UserOBJ>>>
    deleteBlocked: (key: String) => void
}

export const UserContext = createContext<UserContextOBJ>(undefined!);

function UserCTX({ children }: { children: React.ReactChild }) {
    const [uuid, setUuid] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [avatar, setAvatar] = useState<string>("");
    const [accessToken, setAccessToken] = useState<string>("");
    const [friends, setFriend, deleteFriend] = useMap<FriendOBJ>(new Map<String,FriendOBJ>());
	const [blocked, setBlocked, deleteBlocked] = useMap<UserOBJ>(new Map<String,UserOBJ>());

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
                }
            })
        } else {
            window.location.href = "/";
        }
    }, []);

    useEffect(() => {
        fetch(Routes.Blocks, {
            method: "GET",
            headers: {
                "Authorization": localStorage.getItem("access_token") || "",
                "Content-Type": "application/json"
            }
        }).then(response => {
            if (response.status === 200) {
                response.json().then((blocked: UserOBJ[]) => {
                    blocked.forEach(user => {
                        console.log("blocked user", user);
                        setBlocked(prevBlocked => new Map(prevBlocked.set(user.uuid, user)));
                        console.log("blocks count", Array(blocked.values()).length);
                    })
                });
            }
        })
    }, [accessToken]);

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
        setFriend: setFriend,
        deleteFriend: deleteFriend,
        blocked: blocked,
        setBlocked: setBlocked,
        deleteBlocked: deleteBlocked
    }
    
    return (
    <UserContext.Provider value={context_value}>
        {children}
    </UserContext.Provider>
    )
}

export default UserCTX;