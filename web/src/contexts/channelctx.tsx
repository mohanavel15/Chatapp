import React, { useState, createContext, useEffect } from 'react'
import { ChannelOBJ, MessageOBJ, MemberOBJ, DMChannelOBJ } from '../models/models'
import { w3cwebsocket as W3CWebSocket } from "websocket";
import axios from 'axios'
import useDoubleMap from '../hooks/useDoubleMap';

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
	
	channelsLoaded: boolean
	setChannelsLoaded: React.Dispatch<React.SetStateAction<boolean>>
	
	gateway: W3CWebSocket;
}

export const ChannelsContext = createContext<ChannelContext>(undefined!);

export default function ChannelCTX({ children, gateway }: {children: React.ReactChild, gateway: W3CWebSocket}) {
	let [DMChannels, setDMChannels] = useState<Map<String, DMChannelOBJ>>(new Map());
	let [channels, setChannels] = useState<Map<String,ChannelOBJ>>(new Map<String,ChannelOBJ>());
	const [members, UpdateMember, DeleteMember] = useDoubleMap<MemberOBJ>(new Map<String, Map<String, MemberOBJ>>());
	const [messages, UpdateMessage, DeleteMessage] = useDoubleMap<MessageOBJ>(new Map<String, Map<String, MessageOBJ>>());
	let [channelsLoaded, setChannelsLoaded] = useState(false)

	useEffect(() => {
		axios.get<DMChannelOBJ[]>('http://127.0.0.1:5000/users/@me/dms', {
			headers: {
				Authorization: localStorage.getItem("access_token") || ""
			}
		}).then(res => {
			res.data.forEach(channel => {
				setDMChannels(prevChannels => new Map(prevChannels.set(channel.uuid, channel)))
			})
		})
    }, [])

	useEffect(() => {
		axios.get<ChannelOBJ[]>('http://127.0.0.1:5000/users/@me/channels', {
			headers: {
				Authorization: localStorage.getItem("access_token") || ""
			}
		}).then(res => {
			res.data.forEach(channel => {
				setChannels(prevChannels => new Map(prevChannels.set(channel.uuid, channel)))
			})
			setChannelsLoaded(true)
		})
    }, [])

	useEffect(() => {
		const channel_keys: String[] =  Array.from(channels.keys())
		channel_keys.forEach(channel => {
			axios.get<MessageOBJ[]>(`http://127.0.0.1:5000/channels/${channel}/messages`, {
				headers: {
					Authorization: localStorage.getItem("access_token") || ""
				}
			}).then(res => {
				res.data.forEach(msg => UpdateMessage(channel, msg.uuid, msg))
			})
		})
	} , [channelsLoaded])

	useEffect(() => {
		const channel_keys: String[] =  Array.from(channels.keys())
		channel_keys.forEach(channel => {
			axios.get<MemberOBJ[]>(`http://127.0.0.1:5000/channels/${channel}/members`, {
				headers: {
					Authorization: localStorage.getItem("access_token") || ""
				}
			}).then(res => {
				res.data.forEach(member => UpdateMember(channel, member.uuid, member))
			})
		})
	} , [channelsLoaded])

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
		channelsLoaded: channelsLoaded,
		setChannelsLoaded: setChannelsLoaded,
		gateway: gateway
	}

	return (
		<ChannelsContext.Provider value={context_value} >
			{children}
		</ChannelsContext.Provider>
	)
}
