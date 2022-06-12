import { createContext, useEffect, useState } from "react";
import useMap from '../hooks/useMap';
import Routes from "../config";
import { Relationship } from "../models/relationship";
import { GetRelationships } from "../api/relationship";
export interface UserContextOBJ {
    id: string;
    username: string;
    avatar: string;
    accessToken: string;
    setId:React.Dispatch<React.SetStateAction<string>>;
    setUsername:React.Dispatch<React.SetStateAction<string>>;
    setAvatar:React.Dispatch<React.SetStateAction<string>>;
    setAccessToken:React.Dispatch<React.SetStateAction<string>>;
    relationships: Map<String,Relationship>;
	setRelationships: React.Dispatch<React.SetStateAction<Map<String, Relationship>>>
    deleterelationship: (key: String) => void
}

export const UserContext = createContext<UserContextOBJ>(undefined!);

function UserCTX({ children }: { children: React.ReactChild }) {
    const [id, setId] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [avatar, setAvatar] = useState<string>("");
    const [accessToken, setAccessToken] = useState<string>("");
	const [relationships, setRelationships, deleterelationship] = useMap<Relationship>(new Map<String,Relationship>());

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
                        setId(user.id);
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
        GetRelationships(accessToken).then(relationships => {
            relationships.forEach(relationship => {
                setRelationships(prevRelationships => {
                    prevRelationships.set(relationship.id, relationship);
                    return prevRelationships;
                });
            });
        });
    }, [accessToken]);

    const context_value: UserContextOBJ = {
        id: id,
        username: username,
        avatar: avatar,
        accessToken: accessToken,
        setId: setId,
        setUsername: setUsername,
        setAvatar: setAvatar,
        setAccessToken: setAccessToken,
        relationships: relationships,
        setRelationships: setRelationships,
        deleterelationship: deleterelationship
    }
    
    return (
    <UserContext.Provider value={context_value}>
        {children}
    </UserContext.Provider>
    )
}

export default UserCTX;