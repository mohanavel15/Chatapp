import React, { useState, createContext } from 'react'
import { MessageOBJ, ChannelOBJ, MemberOBJ, FriendOBJ } from '../models/models';

export interface ContextMenuCtx {
    showMsgCtxMenu: boolean;
    msgCtxMenu: {x: number, y: number, message:MessageOBJ, channel_id:string};
    setShowMsgCtxMenu: React.Dispatch<React.SetStateAction<boolean>>;
    setMsgCtxMenu: React.Dispatch<React.SetStateAction<{x: number, y: number, message: MessageOBJ, channel_id:string}>>;

    showChannelCtxMenu: boolean;
    channelCtxMenu: {x: number, y: number, channel: ChannelOBJ};
    setShowChannelCtxMenu: React.Dispatch<React.SetStateAction<boolean>>;
    setChannelCtxMenu: React.Dispatch<React.SetStateAction<{x: number, y: number, channel: ChannelOBJ}>>;

    showMemberCtxMenu: boolean;
    memberCtxMenu: {event: React.MouseEvent<HTMLDivElement, MouseEvent>, member:MemberOBJ, channel:ChannelOBJ};
    setShowMemberCtxMenu: React.Dispatch<React.SetStateAction<boolean>>;
    setMemberCtxMenu: React.Dispatch<React.SetStateAction<{event: React.MouseEvent<HTMLDivElement, MouseEvent>, member: MemberOBJ, channel:ChannelOBJ}>>;

    showFriendCtxMenu: boolean;
    friendCtxMenu: {x: number, y: number, friend_obj: FriendOBJ};
    setShowFriendCtxMenu: React.Dispatch<React.SetStateAction<boolean>>;
    setFriendCtxMenu: React.Dispatch<React.SetStateAction<{x: number, y: number, friend_obj: FriendOBJ}>>;

    closeAll: () => void;
}

export const ContextMenu = createContext<ContextMenuCtx>(undefined!);

export function CtxMenuCtx({ children }: {children: React.ReactChild}) {
	const [showMsgCtxMenu, setShowMsgCtxMenu] = useState(false);
	const [msgCtxMenu, setMsgCtxMenu] = useState<{x: number, y: number, message:MessageOBJ, channel_id:string}>(undefined!);

    const [showChannelCtxMenu, setShowChannelCtxMenu] = useState(false);
    const [channelCtxMenu, setChannelCtxMenu] = useState<{x: number, y: number, channel:ChannelOBJ}>(undefined!);

    const [showMemberCtxMenu, setShowMemberCtxMenu] = useState(false);
	const [memberCtxMenu, setMemberCtxMenu] = useState<{event: React.MouseEvent<HTMLDivElement, MouseEvent>, member:MemberOBJ, channel:ChannelOBJ}>(undefined!);

    const [showFriendCtxMenu, setShowFriendCtxMenu] = useState(false);
    const [friendCtxMenu, setFriendCtxMenu] = useState<{x: number, y: number, friend_obj:FriendOBJ}>(undefined!);

    function closeAll() {
        setShowMsgCtxMenu(false);
        setShowChannelCtxMenu(false);
        setShowMemberCtxMenu(false);
        setShowFriendCtxMenu(false);
    }

    const context_value: ContextMenuCtx = {
		showMsgCtxMenu: showMsgCtxMenu,
		msgCtxMenu: msgCtxMenu,
		setShowMsgCtxMenu: setShowMsgCtxMenu,
		setMsgCtxMenu: setMsgCtxMenu,
        
        showChannelCtxMenu: showChannelCtxMenu,
        channelCtxMenu: channelCtxMenu,
        setShowChannelCtxMenu: setShowChannelCtxMenu,
        setChannelCtxMenu: setChannelCtxMenu,

        showMemberCtxMenu: showMemberCtxMenu,
        memberCtxMenu: memberCtxMenu,
        setShowMemberCtxMenu: setShowMemberCtxMenu,
        setMemberCtxMenu: setMemberCtxMenu,
        
        showFriendCtxMenu: showFriendCtxMenu,
        friendCtxMenu: friendCtxMenu,
        setShowFriendCtxMenu: setShowFriendCtxMenu,
        setFriendCtxMenu: setFriendCtxMenu,

        closeAll: closeAll
    }

    return (
        <ContextMenu.Provider value={context_value} >
            {children}
        </ContextMenu.Provider>
    )
}
