import React, { useState, createContext, useEffect } from 'react'
import { ChannelOBJ, MessageOBJ, MemberOBJ } from '../models/models'
import { w3cwebsocket as W3CWebSocket } from "websocket";
import axios from 'axios'

export interface ChannelContext {
	channels: Map<String,ChannelOBJ>;
	setChannels: React.Dispatch<React.SetStateAction<Map<String, ChannelOBJ>>>
	
	messages: Map<String, Map<String, MessageOBJ>>;
	setMessages: React.Dispatch<React.SetStateAction<Map<String, Map<String, MessageOBJ>>>>
	
	members: Map<String, Map<String, MemberOBJ>>;
	setMembers: React.Dispatch<React.SetStateAction<Map<String, Map<String, MemberOBJ>>>>
	
	channelsLoaded: boolean
	setChannelsLoaded: React.Dispatch<React.SetStateAction<boolean>>
	
	gateway: W3CWebSocket;
}

export const ChannelsContext = createContext<ChannelContext>(undefined!);

export default function ChannelCTX({ children, gateway }: {children: React.ReactChild, gateway: W3CWebSocket}) {
	
	let [channels, setChannels] = useState<Map<String,ChannelOBJ>>(new Map<String,ChannelOBJ>());
	let [members, setMembers] = useState<Map<String, Map<String, MemberOBJ>>>(new Map<String, Map<String, MemberOBJ>>());
	let [messages, setMessages] = useState<Map<String, Map<String, MessageOBJ>>>(new Map<String, Map<String, MessageOBJ>>())

	let [channelsLoaded, setChannelsLoaded] = useState(false)

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
				setMessages(prevMsgs =>  new Map(prevMsgs.set(channel, new Map(res.data.map(msgs => [msgs.uuid, msgs])))))
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
				setMembers(prevMembers =>  new Map(prevMembers.set(channel, new Map(res.data.map(member => [member.uuid, member])))))
			})
		})
	} , [channelsLoaded])

	const context_value: ChannelContext = {
		channels: channels,
		setChannels: setChannels,
		messages: messages,
		setMessages: setMessages,
		members: members,
		setMembers: setMembers,
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
