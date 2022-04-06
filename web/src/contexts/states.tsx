import React, { useState, createContext } from 'react'
import { ChannelOBJ, MemberOBJ, MessageOBJ } from '../models/models';

export interface StateContext {
    Mute: boolean;
    Deafen: boolean;
    Settings: boolean;
    createChannel: boolean;
    editChannel: boolean;
    deleteChannel: boolean;
    ChannelOBJ: ChannelOBJ;
    deleteMessage: boolean;
    messageOBJ: MessageOBJ;
    showProfile: boolean;
    ProfileOBJ: MemberOBJ;
    setMute: React.Dispatch<React.SetStateAction<boolean>>;
    setDeafen: React.Dispatch<React.SetStateAction<boolean>>;
    setSettings: React.Dispatch<React.SetStateAction<boolean>>;
    setCreateChannel: React.Dispatch<React.SetStateAction<boolean>>;
    setEditChannel: React.Dispatch<React.SetStateAction<boolean>>;
    setDeleteChannel: React.Dispatch<React.SetStateAction<boolean>>;
    setChannelOBJ: React.Dispatch<React.SetStateAction<ChannelOBJ>>;
    setDeleteMessage: React.Dispatch<React.SetStateAction<boolean>>;
    setMessageOBJ: React.Dispatch<React.SetStateAction<MessageOBJ>>;
    setShowProfile: React.Dispatch<React.SetStateAction<boolean>>;
    setProfileOBJ: React.Dispatch<React.SetStateAction<MemberOBJ>>;
}

export const StatesContext = createContext<StateContext>(undefined!);

export function States({ children }: {children: React.ReactChild}) {
    const [Mute, setMute] = useState(false)
    const [Deafen, setDeafen] = useState(false)
    const [Settings, setSettings] = useState(false)

    const [createChannel, setCreateChannel] = useState(false)
    const [editChannel, setEditChannel] = useState(false)
    const [deleteChannel, setDeleteChannel] = useState(false)
    const [ChannelOBJ, setChannelOBJ] = useState<ChannelOBJ>(undefined!)

    const [deleteMessage, setDeleteMessage] = useState(false)
    const [messageOBJ, setMessageOBJ] = useState<MessageOBJ>(undefined!)

    const [showProfile, setShowProfile] = useState(false)
    const [ProfileOBJ, setProfileOBJ] = useState<MemberOBJ>(undefined!)

    const context_value: StateContext = {
        Mute: Mute,
        Deafen: Deafen,
        Settings: Settings,
        createChannel: createChannel,
        editChannel: editChannel,
        deleteChannel: deleteChannel,
        ChannelOBJ: ChannelOBJ,
        deleteMessage: deleteMessage,
        messageOBJ: messageOBJ,
        showProfile: showProfile,
        ProfileOBJ: ProfileOBJ,
        setMute: setMute,
        setDeafen: setDeafen,
        setSettings: setSettings,
        setCreateChannel: setCreateChannel,
        setEditChannel: setEditChannel,
        setDeleteChannel: setDeleteChannel,
        setChannelOBJ: setChannelOBJ,
        setDeleteMessage: setDeleteMessage,
        setMessageOBJ: setMessageOBJ,
        setShowProfile: setShowProfile,
        setProfileOBJ: setProfileOBJ
    }

    return (
        <StatesContext.Provider value={context_value} >
            {children}
        </StatesContext.Provider>
    )
}