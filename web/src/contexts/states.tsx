import React, { useState, createContext } from 'react'
import { ChannelOBJ } from '../models/models';

export interface StateContext {
    Mute: boolean;
    Deafen: boolean;
    Settings: boolean;
    createChannel: boolean;
    editChannel: boolean;
    editChannelOBJ: ChannelOBJ;
    setMute: React.Dispatch<React.SetStateAction<boolean>>;
    setDeafen: React.Dispatch<React.SetStateAction<boolean>>;
    setSettings: React.Dispatch<React.SetStateAction<boolean>>;
    setCreateChannel: React.Dispatch<React.SetStateAction<boolean>>;
    setEditChannel: React.Dispatch<React.SetStateAction<boolean>>;
    setEditChannelOBJ: React.Dispatch<React.SetStateAction<ChannelOBJ>>;
}

export const StatesContext = createContext<StateContext>(undefined!);

export function States({ children }: {children: React.ReactChild}) {
    const [Mute, setMute] = useState(false)
    const [Deafen, setDeafen] = useState(false)
    const [Settings, setSettings] = useState(false)
    const [createChannel, setCreateChannel] = useState(false)

    const [editChannel, setEditChannel] = useState(false)
    const [editChannelOBJ, setEditChannelOBJ] = useState<ChannelOBJ>(undefined!)

    const context_value: StateContext = {
        Mute: Mute,
        Deafen: Deafen,
        Settings: Settings,
        createChannel: createChannel,
        editChannel: editChannel,
        editChannelOBJ: editChannelOBJ,
        setMute: setMute,
        setDeafen: setDeafen,
        setSettings: setSettings,
        setCreateChannel: setCreateChannel,
        setEditChannel: setEditChannel,
        setEditChannelOBJ: setEditChannelOBJ
    }

    return (
        <StatesContext.Provider value={context_value} >
            {children}
        </StatesContext.Provider>
    )
}