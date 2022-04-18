import React, { useState, createContext, useEffect } from 'react'
import { ChannelOBJ, MessageOBJ, MemberOBJ, DMChannelOBJ } from '../models/models'
import useDoubleMap from '../hooks/useDoubleMap';
import Routes from '../config';

export interface ChannelContext {
	DMChannels: Map<String,DMChannelOBJ>;
	setDMChannels: React.Dispatch<React.SetStateAction<Map<String, DMChannelOBJ>>>

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
	let [DMChannels, setDMChannels] = useState<Map<String, DMChannelOBJ>>(new Map());
	let [channels, setChannels] = useState<Map<String,ChannelOBJ>>(new Map<String,ChannelOBJ>());
	const [members, UpdateMember, DeleteMember] = useDoubleMap<MemberOBJ>(new Map<String, Map<String, MemberOBJ>>());
	const [messages, UpdateMessage, DeleteMessage] = useDoubleMap<MessageOBJ>(new Map<String, Map<String, MessageOBJ>>());

	useEffect(() => {
		const dm_channel_keys: String[] =  Array.from(DMChannels.keys())
		const channel_keys: String[] =  Array.from(channels.keys())
		const keys: String[] = [...dm_channel_keys, ...channel_keys]
		keys.forEach(key => {
			if (!messages.has(key)) {
				const url = Routes.Channels+`/${key}/messages`
				fetch(url, {
					method: "GET",
					headers: {
						"Authorization": localStorage.getItem("access_token") || ""
					}
				}).then(response => {
					if (response.status === 200) {
						response.json().then((msgs: MessageOBJ[]) => {
							msgs.forEach(msg => UpdateMessage(key, msg.uuid, msg))
						})
					}
				})

			}
		})
	} , [channels, DMChannels])

	useEffect(() => {
		const channel_keys: String[] =  Array.from(channels.keys())
		channel_keys.forEach(channel => {
			if (!members.has(channel)) {
				const url = Routes.Channels+`/${channel}/members`
				fetch(url, {
					method: "GET",
					headers: {
						"Authorization": localStorage.getItem("access_token") || ""
					}
				}).then(response => {
					if (response.status === 200) {
						response.json().then((msgs: MemberOBJ[]) => {
							msgs.forEach(member => UpdateMember(channel, member.uuid, member))
						})
					}
				})
			}
		})
	} , [channels])

	const context_value: ChannelContext = {
		DMChannels: DMChannels,
		setDMChannels: setDMChannels,
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
