import React, { useState, createContext } from 'react'
import { MessageOBJ, ChannelOBJ, UserOBJ } from '../models/models';
import { Relationship } from '../models/relationship';
export interface ContextMenuType {
    showMsgCtxMenu: boolean;
    msgCtxMenu: {x: number, y: number, message:MessageOBJ};
    setShowMsgCtxMenu: React.Dispatch<React.SetStateAction<boolean>>;
    setMsgCtxMenu: React.Dispatch<React.SetStateAction<{x: number, y: number, message: MessageOBJ}>>;

    showChannelCtxMenu: boolean;
    channelCtxMenu: {x: number, y: number, channel: ChannelOBJ};
    setShowChannelCtxMenu: React.Dispatch<React.SetStateAction<boolean>>;
    setChannelCtxMenu: React.Dispatch<React.SetStateAction<{x: number, y: number, channel: ChannelOBJ}>>;

    showMemberCtxMenu: boolean;
    memberCtxMenu: {event: React.MouseEvent<HTMLDivElement, MouseEvent>, member:UserOBJ, channel:ChannelOBJ};
    setShowMemberCtxMenu: React.Dispatch<React.SetStateAction<boolean>>;
    setMemberCtxMenu: React.Dispatch<React.SetStateAction<{event: React.MouseEvent<HTMLDivElement, MouseEvent>, member:UserOBJ, channel:ChannelOBJ}>>;

    showFriendCtxMenu: boolean;
    friendCtxMenu: {x: number, y: number, friend_obj: Relationship};
    setShowFriendCtxMenu: React.Dispatch<React.SetStateAction<boolean>>;
    setFriendCtxMenu: React.Dispatch<React.SetStateAction<{x: number, y: number, friend_obj: Relationship}>>;

    closeAll: () => void;
}

export const ContextMenu = createContext<ContextMenuType>(undefined!);

export default function ContextMenuProvider({ children }: {children: React.ReactChild}) {
	const [showMsgCtxMenu, setShowMsgCtxMenu] = useState(false);
	const [msgCtxMenu, setMsgCtxMenu] = useState<{x: number, y: number, message:MessageOBJ}>(undefined!);

    const [showChannelCtxMenu, setShowChannelCtxMenu] = useState(false);
    const [channelCtxMenu, setChannelCtxMenu] = useState<{x: number, y: number, channel:ChannelOBJ}>(undefined!);

    const [showMemberCtxMenu, setShowMemberCtxMenu] = useState(false);
	const [memberCtxMenu, setMemberCtxMenu] = useState<{event: React.MouseEvent<HTMLDivElement, MouseEvent>, member:UserOBJ, channel:ChannelOBJ}>(undefined!);

    const [showFriendCtxMenu, setShowFriendCtxMenu] = useState(false);
    const [friendCtxMenu, setFriendCtxMenu] = useState<{x: number, y: number, friend_obj:Relationship}>(undefined!);

    function closeAll() {
        setShowMsgCtxMenu(false);
        setShowChannelCtxMenu(false);
        setShowMemberCtxMenu(false);
        setShowFriendCtxMenu(false);
    }

    const context_value: ContextMenuType = {
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
