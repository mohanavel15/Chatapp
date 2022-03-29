import React, { useState, createContext } from 'react'
import { MessageOBJ, ChannelOBJ, MemberOBJ } from '../models/models';

export interface ContextMenuCtx {
    showMsgCtxMenu: boolean;
    ctxMsgMenuLocation: {x: number, y: number, message:MessageOBJ, channel:ChannelOBJ};
    setShowMsgCtxMenu: React.Dispatch<React.SetStateAction<boolean>>;
    setMsgCtxMenuLocation: React.Dispatch<React.SetStateAction<{x: number, y: number, message: MessageOBJ, channel:ChannelOBJ}>>;

    showChannelCtxMenu: boolean;
    ctxChannelMenuLocation: {x: number, y: number, channel: ChannelOBJ};
    setShowChannelCtxMenu: React.Dispatch<React.SetStateAction<boolean>>;
    setChannelCtxMenuLocation: React.Dispatch<React.SetStateAction<{x: number, y: number, channel: ChannelOBJ}>>;

    showMemberCtxMenu: boolean;
    ctxMemberMenuLocation: {event: React.MouseEvent<HTMLDivElement, MouseEvent>, member:MemberOBJ, channel:ChannelOBJ};
    setShowMemberCtxMenu: React.Dispatch<React.SetStateAction<boolean>>;
    setMemberCtxMenuLocation: React.Dispatch<React.SetStateAction<{event: React.MouseEvent<HTMLDivElement, MouseEvent>, member: MemberOBJ, channel:ChannelOBJ}>>;

    closeAll: () => void;
}

export const ContextMenu = createContext<ContextMenuCtx>(undefined!);

export function CtxMenuCtx({ children }: {children: React.ReactChild}) {
	const [showMsgCtxMenu, setShowMsgCtxMenu] = useState(false);
	const [ctxMsgMenuLocation, setMsgCtxMenuLocation] = useState<{x: number, y: number, message:MessageOBJ, channel:ChannelOBJ}>(undefined!);

    const [showChannelCtxMenu, setShowChannelCtxMenu] = useState(false);
    const [ctxChannelMenuLocation, setChannelCtxMenuLocation] = useState<{x: number, y: number, channel:ChannelOBJ}>(undefined!);

    const [showMemberCtxMenu, setShowMemberCtxMenu] = useState(false);
	const [ctxMemberMenuLocation, setMemberCtxMenuLocation] = useState<{event: React.MouseEvent<HTMLDivElement, MouseEvent>, member:MemberOBJ, channel:ChannelOBJ}>(undefined!);

    function closeAll() {
        setShowMsgCtxMenu(false);
        setShowChannelCtxMenu(false);
        setShowMemberCtxMenu(false);
    }

    const context_value: ContextMenuCtx = {
		showMsgCtxMenu: showMsgCtxMenu,
		ctxMsgMenuLocation: ctxMsgMenuLocation,
		setShowMsgCtxMenu: setShowMsgCtxMenu,
		setMsgCtxMenuLocation: setMsgCtxMenuLocation,
        
        showChannelCtxMenu: showChannelCtxMenu,
        ctxChannelMenuLocation: ctxChannelMenuLocation,
        setShowChannelCtxMenu: setShowChannelCtxMenu,
        setChannelCtxMenuLocation: setChannelCtxMenuLocation,

        showMemberCtxMenu: showMemberCtxMenu,
        ctxMemberMenuLocation: ctxMemberMenuLocation,
        setShowMemberCtxMenu: setShowMemberCtxMenu,
        setMemberCtxMenuLocation: setMemberCtxMenuLocation,

        closeAll: closeAll
    }

    return (
        <ContextMenu.Provider value={context_value} >
            {children}
        </ContextMenu.Provider>
    )
}
