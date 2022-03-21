import React, { useState, createContext, useEffect } from 'react'
import { ChannelOBJ, MessageOBJ, UserOBJ } from '../models/models'
import { w3cwebsocket as W3CWebSocket, IMessageEvent } from "websocket";
import axios from 'axios'

export interface ChannelContext {
	channels: Map<String,ChannelOBJ>;
	setChannels: React.Dispatch<React.SetStateAction<Map<String, ChannelOBJ>>>
	messages: MessageOBJ[];
	setMessages: React.Dispatch<React.SetStateAction<MessageOBJ[]>>
	members: Map<String, UserOBJ[]>;
	setMembers: React.Dispatch<React.SetStateAction<Map<String, UserOBJ[]>>>
	gateway: W3CWebSocket;
}

export const ChannelsContext = createContext<ChannelContext>(undefined!);

export default function ChannelCTX({ children, gateway }: {children: React.ReactChild, gateway: W3CWebSocket}) {
	
	let [channels, setChannels] = useState<Map<String,ChannelOBJ>>(new Map<String,ChannelOBJ>());
	let [members, setMembers] = useState<Map<String, UserOBJ[]>>(new Map<String, UserOBJ[]>());
	let [messages, setMessages] = useState<MessageOBJ[]>([])

	useEffect(() => {
		axios.get<ChannelOBJ[]>('http://127.0.0.1:5000/users/@me/channels', {
			headers: {
				Authorization: localStorage.getItem("access_token") || ""
			}
		}).then(res => {
			res.data.forEach(channel => {
				setChannels(channels.set(channel.uuid, channel));
			})
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
				res.data.forEach(message => {
					setMessages(prevMessages => [...prevMessages, message])
				})
			})
			console.log("Printing messages", messages);
		})
	} , [channels])

	useEffect(() => {
		const channel_keys: String[] =  Array.from(channels.keys())
		channel_keys.forEach(channel => {
			axios.get<UserOBJ[]>(`http://127.0.0.1:5000/channels/${channel}/members`, {
				headers: {
					Authorization: localStorage.getItem("access_token") || ""
				}
			}).then(res => {
				console.log(res.data);
				res.data.forEach(member => {
					setMembers(members.set(channel, res.data))
				})
			})
			console.log("Printing members.", members);
		})
	} , [channels])

	const context_value: ChannelContext = {
		channels: channels,
		setChannels: setChannels,
		messages: messages,
		setMessages: setMessages,
		members: members,
		setMembers: setMembers,
		gateway: gateway
	}

	return (
		<ChannelsContext.Provider value={context_value} >
			{children}
		</ChannelsContext.Provider>
	)
}
