import React from 'react'
import { useContext } from 'react';
import { ChannelContext, StateContext } from "../contexts/states";

function Settings() {
    const state_context: StateContext = useContext(ChannelContext);

    return (
        <>
        <h3>Settings</h3>
        <button onClick={() => { state_context.setSettings(false) }}> Back </button>
        </>
    )
}

export default Settings;