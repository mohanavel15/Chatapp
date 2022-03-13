import React, { useState, createContext } from 'react'

export interface StateContext {
    Mute: boolean;
    Deafen: boolean;
    Settings: boolean;
    setMute: React.Dispatch<React.SetStateAction<boolean>>;
    setDeafen: React.Dispatch<React.SetStateAction<boolean>>;
    setSettings: React.Dispatch<React.SetStateAction<boolean>>;
}

export const StatesContext = createContext<StateContext>(undefined!);

export function States({ children }: {children: React.ReactChild}) {
    const [Mute, setMute] = useState(false)
    const [Deafen, setDeafen] = useState(false)
    const [Settings, setSettings] = useState(false)
    
    const context_value: StateContext = {
        Mute: Mute,
        Deafen: Deafen,
        Settings: Settings,
        setMute: setMute,
        setDeafen: setDeafen,
        setSettings: setSettings
    }

    return (
        <StatesContext.Provider value={context_value} >
            {children}
        </StatesContext.Provider>
    )
}