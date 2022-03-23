import React, { useState, createContext, useEffect } from 'react'
import { ChannelOBJ, MessageOBJ, UserOBJ, MemberOBJ } from '../models/models'
import { w3cwebsocket as W3CWebSocket, IMessageEvent } from "websocket";
import axios from 'axios'

export interface ChannelContext {
	channels: Map<String,ChannelOBJ>;
	setChannels: React.Dispatch<React.SetStateAction<Map<String, ChannelOBJ>>>
	
	messages: MessageOBJ[];
	setMessages: React.Dispatch<React.SetStateAction<MessageOBJ[]>>
	
	members: Map<String, MemberOBJ[]>;
	setMembers: React.Dispatch<React.SetStateAction<Map<String, MemberOBJ[]>>>
	
	channelsLoaded: boolean
	setChannelsLoaded: React.Dispatch<React.SetStateAction<boolean>>

	messagesLoaded: boolean
	setMessagesLoaded: React.Dispatch<React.SetStateAction<boolean>>

	membersLoaded: boolean
	setMembersLoaded: React.Dispatch<React.SetStateAction<boolean>>

	gateway: W3CWebSocket;
}

export const ChannelsContext = createContext<ChannelContext>(undefined!);

export default function ChannelCTX({ children, gateway }: {children: React.ReactChild, gateway: W3CWebSocket}) {
	
	let [channels, setChannels] = useState<Map<String,ChannelOBJ>>(new Map<String,ChannelOBJ>());
	let [members, setMembers] = useState<Map<String, MemberOBJ[]>>(new Map<String, MemberOBJ[]>());
	let [messages, setMessages] = useState<MessageOBJ[]>([])

	let [channelsLoaded, setChannelsLoaded] = useState(false)
	let [membersLoaded, setMembersLoaded] = useState(false)
	let [messagesLoaded, setMessagesLoaded] = useState(false)


	useEffect(() => {
		axios.get<ChannelOBJ[]>('http://127.0.0.1:5000/users/@me/channels', {
			headers: {
				Authorization: localStorage.getItem("access_token") || ""
			}
		}).then(res => {
			res.data.forEach(channel => {
				setChannels(prevChannels => prevChannels.set(channel.uuid, channel))
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
				console.log(res.data);
				setMessages(prevMessages => [...prevMessages, ...res.data])
				setMessagesLoaded(!messagesLoaded)
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
				setMembers(prevMembers =>  prevMembers.set(channel, res.data))
				setMembersLoaded(!membersLoaded)
			})
			console.log("Printing members.", members);
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
		messagesLoaded: messagesLoaded,
		setMessagesLoaded: setMessagesLoaded,
		membersLoaded: membersLoaded,
		setMembersLoaded: setMembersLoaded,
		gateway: gateway
	}

	return (
		<ChannelsContext.Provider value={context_value} >
			{children}
		</ChannelsContext.Provider>
	)
}
