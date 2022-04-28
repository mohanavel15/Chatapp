import React, { useState, createContext } from 'react'
import { ChannelOBJ, MessageOBJ, MemberOBJ } from '../models/models'
import useDoubleMap from '../hooks/useDoubleMap';
import Routes from '../config';

export interface ChannelContext {
	channels: Map<String,ChannelOBJ>;
	setChannels: React.Dispatch<React.SetStateAction<Map<String, ChannelOBJ>>>
	
	messages: Map<String, Map<String, MessageOBJ>>;
	UpdateMessage: (key1: String, key2: String, value_: MessageOBJ) => void
	DeleteMessage: (key1: String, key2: String) => void
	
	members: Map<String, Map<String, MemberOBJ>>;
	UpdateMember: (key1: String, key2: String, value_: MemberOBJ) => void
	DeleteMember: (key1: String, key2: String) => void
	
	gateway: WebSocket;
}

export const ChannelsContext = createContext<ChannelContext>(undefined!);

export default function ChannelCTX({ children, gateway }: {children: React.ReactChild, gateway: WebSocket}) {
	let [channels, setChannels] = useState<Map<String,ChannelOBJ>>(new Map<String,ChannelOBJ>());
	const [members, UpdateMember, DeleteMember] = useDoubleMap<MemberOBJ>(new Map<String, Map<String, MemberOBJ>>());
	const [messages, UpdateMessage, DeleteMessage] = useDoubleMap<MessageOBJ>(new Map<String, Map<String, MessageOBJ>>());

	const context_value: ChannelContext = {
		channels: channels,
		setChannels: setChannels,
		messages: messages,
		UpdateMessage: UpdateMessage,
		DeleteMessage: DeleteMessage,
		members: members,
		UpdateMember: UpdateMember,
		DeleteMember: DeleteMember,
		gateway: gateway
	}

	return (
		<ChannelsContext.Provider value={context_value} >
			{children}
		</ChannelsContext.Provider>
	)
}
