import React, { useState, createContext } from 'react'
import { MessageOBJ, ChannelOBJ } from '../models/models';

export interface ContextMenuCtx {
    showMsgCtxMenu: boolean;
    ctxMsgMenuLocation: {x: number, y: number, message:MessageOBJ};
    setShowMsgCtxMenu: React.Dispatch<React.SetStateAction<boolean>>;
    setMsgCtxMenuLocation: React.Dispatch<React.SetStateAction<{x: number, y: number, message: MessageOBJ}>>;

    showChannelCtxMenu: boolean;
    ctxChannelMenuLocation: {x: number, y: number, channel: ChannelOBJ};
    setShowChannelCtxMenu: React.Dispatch<React.SetStateAction<boolean>>;
    setChannelCtxMenuLocation: React.Dispatch<React.SetStateAction<{x: number, y: number, channel: ChannelOBJ}>>;

}

export const ContextMenu = createContext<ContextMenuCtx>(undefined!);

export function CtxMenuCtx({ children }: {children: React.ReactChild}) {
	const [showMsgCtxMenu, setShowMsgCtxMenu] = useState(false);
	const [ctxMsgMenuLocation, setMsgCtxMenuLocation] = useState<{x: number, y: number, message:MessageOBJ}>(undefined!);

    const [showChannelCtxMenu, setShowChannelCtxMenu] = useState(false);
    const [ctxChannelMenuLocation, setChannelCtxMenuLocation] = useState<{x: number, y: number, channel:ChannelOBJ}>(undefined!);

    const context_value: ContextMenuCtx = {
		showMsgCtxMenu: showMsgCtxMenu,
		ctxMsgMenuLocation: ctxMsgMenuLocation,
		setShowMsgCtxMenu: setShowMsgCtxMenu,
		setMsgCtxMenuLocation: setMsgCtxMenuLocation,
        
        showChannelCtxMenu: showChannelCtxMenu,
        ctxChannelMenuLocation: ctxChannelMenuLocation,
        setShowChannelCtxMenu: setShowChannelCtxMenu,
        setChannelCtxMenuLocation: setChannelCtxMenuLocation
    }

    return (
        <ContextMenu.Provider value={context_value} >
            {children}
        </ContextMenu.Provider>
    )
}
