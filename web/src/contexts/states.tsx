import React, { useState, createContext } from 'react'

export interface StateContext {
    Mute: boolean;
    Deafen: boolean;
    Settings: boolean;
    createChannel: boolean;
    setMute: React.Dispatch<React.SetStateAction<boolean>>;
    setDeafen: React.Dispatch<React.SetStateAction<boolean>>;
    setSettings: React.Dispatch<React.SetStateAction<boolean>>;
    setCreateChannel: React.Dispatch<React.SetStateAction<boolean>>;
}

export const StatesContext = createContext<StateContext>(undefined!);

export function States({ children }: {children: React.ReactChild}) {
    const [Mute, setMute] = useState(false)
    const [Deafen, setDeafen] = useState(false)
    const [Settings, setSettings] = useState(false)
    const [createChannel, setCreateChannel] = useState(false)

    const context_value: StateContext = {
        Mute: Mute,
        Deafen: Deafen,
        Settings: Settings,
        createChannel: createChannel,
        setMute: setMute,
        setDeafen: setDeafen,
        setSettings: setSettings,
        setCreateChannel: setCreateChannel
    }

    return (
        <StatesContext.Provider value={context_value} >
            {children}
        </StatesContext.Provider>
    )
}