import { useState, createContext } from "react";
import { MessageOBJ } from "../models/models";

export interface MessageContextOBJ {
    message: MessageOBJ
    setMessage: React.Dispatch<React.SetStateAction<MessageOBJ>>
    messageEdit: boolean
    setMessageEdit: React.Dispatch<React.SetStateAction<boolean>>
}

export const MessageContext = createContext<MessageContextOBJ>(undefined!);

function MessageCTX({ children }: { children: React.ReactChild }) {
    const [message, setMessage] = useState<MessageOBJ>(undefined!);
    const [messageEdit, setMessageEdit] = useState(false);

    const value: MessageContextOBJ = {
        message,
        setMessage,
        messageEdit,
        setMessageEdit
    }

    return (
        <MessageContext.Provider value={value}>
            {children}
        </MessageContext.Provider>
    );
}

export default MessageCTX;