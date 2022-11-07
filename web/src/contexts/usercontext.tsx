import { createContext, useEffect, useState } from "react";
import useMap from '../hooks/useMap';
import Routes from "../config";
import { Relationship } from "../models/relationship";
import { GetRelationships } from "../api/relationship";
export interface UserContextOBJ {
    id: string;
    username: string;
    avatar: string;
    setId:React.Dispatch<React.SetStateAction<string>>;
    setUsername:React.Dispatch<React.SetStateAction<string>>;
    setAvatar:React.Dispatch<React.SetStateAction<string>>;
    relationships: Map<String,Relationship>;
	setRelationships: React.Dispatch<React.SetStateAction<Map<String, Relationship>>>;
    deleterelationship: (key: String) => void;
    isLoggedIn: boolean;
    setIsLoggedIn:React.Dispatch<React.SetStateAction<boolean>>;
}

export const UserContext = createContext<UserContextOBJ>(undefined!);

function UserCTX({ children }: { children: React.ReactChild }) {
    const [id, setId] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [avatar, setAvatar] = useState<string>("");
	const [relationships, setRelationships, deleterelationship] = useMap<Relationship>(new Map<String,Relationship>());
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        fetch(Routes.currentUser).then(response => {
            if (response.status === 200) {
                setIsLoggedIn(true)
                response.json().then(user => {
                    setId(user.id);
                    setUsername(user.username);
                    setAvatar(user.avatar);
                });
            } else {
                setIsLoggedIn(false)
            }
        })
    }, []);

    useEffect(() => {
        GetRelationships().then(relationships => {
            relationships.forEach(relationship => {
                setRelationships(prevRelationships => {
                    prevRelationships.set(relationship.id, relationship);
                    return prevRelationships;
                });
            });
        });
    }, []);

    const context_value: UserContextOBJ = {
        id: id,
        username: username,
        avatar: avatar,
        setId: setId,
        setUsername: setUsername,
        setAvatar: setAvatar,
        relationships: relationships,
        setRelationships: setRelationships,
        deleterelationship: deleterelationship,
        isLoggedIn: isLoggedIn,
        setIsLoggedIn: setIsLoggedIn
    }
    
    return (
    <UserContext.Provider value={context_value}>
        {children}
    </UserContext.Provider>
    )
}

export default UserCTX;