import React, { useState, createContext } from 'react'
import { ChannelOBJ, MemberOBJ, MessageOBJ } from '../models/models';

export interface StateContext {
    Settings: boolean;
    createChannel: boolean;
    editChannel: boolean;
    deleteChannel: boolean;
    ChannelOBJ: ChannelOBJ;
    deleteMessage: boolean;
    messageOBJ: MessageOBJ;
    showMembers: boolean;
    showKickBan: boolean;
    isBan: boolean;
    KickBanMember: MemberOBJ | undefined;
    setSettings: React.Dispatch<React.SetStateAction<boolean>>;
    setCreateChannel: React.Dispatch<React.SetStateAction<boolean>>;
    setEditChannel: React.Dispatch<React.SetStateAction<boolean>>;
    setDeleteChannel: React.Dispatch<React.SetStateAction<boolean>>;
    setChannelOBJ: React.Dispatch<React.SetStateAction<ChannelOBJ>>;
    setDeleteMessage: React.Dispatch<React.SetStateAction<boolean>>;
    setMessageOBJ: React.Dispatch<React.SetStateAction<MessageOBJ>>;
    setShowMembers: React.Dispatch<React.SetStateAction<boolean>>;
    setShowKickBan: React.Dispatch<React.SetStateAction<boolean>>;
    setIsBan: React.Dispatch<React.SetStateAction<boolean>>;
    setKickBanMember: React.Dispatch<React.SetStateAction<MemberOBJ | undefined>>;
}

export const StatesContext = createContext<StateContext>(undefined!);

export function States({ children }: {children: React.ReactChild}) {
    const [Settings, setSettings] = useState(false)

    const [createChannel, setCreateChannel] = useState(false)
    const [editChannel, setEditChannel] = useState(false)
    const [deleteChannel, setDeleteChannel] = useState(false)
    const [ChannelOBJ, setChannelOBJ] = useState<ChannelOBJ>(undefined!)

    const [deleteMessage, setDeleteMessage] = useState(false)
    const [messageOBJ, setMessageOBJ] = useState<MessageOBJ>(undefined!)

    const [showKickBan, setShowKickBan] = useState(false)
    const [isBan, setIsBan] = useState(false)
    const [KickBanMember, setKickBanMember] = useState<MemberOBJ>()

    const [showMembers, setShowMembers] = useState(true)

    const context_value: StateContext = {
        Settings: Settings,
        createChannel: createChannel,
        editChannel: editChannel,
        deleteChannel: deleteChannel,
        ChannelOBJ: ChannelOBJ,
        deleteMessage: deleteMessage,
        messageOBJ: messageOBJ,
        showMembers: showMembers,
        showKickBan: showKickBan,
        isBan: isBan,
        KickBanMember: KickBanMember,
        setSettings: setSettings,
        setCreateChannel: setCreateChannel,
        setEditChannel: setEditChannel,
        setDeleteChannel: setDeleteChannel,
        setChannelOBJ: setChannelOBJ,
        setDeleteMessage: setDeleteMessage,
        setMessageOBJ: setMessageOBJ,
        setShowMembers: setShowMembers,
        setShowKickBan: setShowKickBan,
        setIsBan: setIsBan,
        setKickBanMember: setKickBanMember,
    }

    return (
        <StatesContext.Provider value={context_value} >
            {children}
        </StatesContext.Provider>
    )
}