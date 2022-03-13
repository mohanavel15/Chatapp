import React, { useState, createContext, useEffect } from 'react'
import { ChannelOBJ, MessageOBJ } from '../models/models'
import { w3cwebsocket as W3CWebSocket, IMessageEvent } from "websocket";
import axios from 'axios'

export interface ChannelContext {
	channels: Map<String,ChannelOBJ>;
	setChannels: React.Dispatch<React.SetStateAction<Map<String, ChannelOBJ>>>
	messages: MessageOBJ[];
	setMessages: React.Dispatch<React.SetStateAction<MessageOBJ[]>>
	gateway: W3CWebSocket;
}

export const ChannelsContext = createContext<ChannelContext>(undefined!);

export default function ChannelCTX({ children, gateway }: {children: React.ReactChild, gateway: W3CWebSocket}) {
	
	let [channels, setChannels] = useState<Map<String,ChannelOBJ>>(new Map<String,ChannelOBJ>());
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

	const context_value: ChannelContext = {
		channels: channels,
		setChannels: setChannels,
		messages: messages,
		setMessages: setMessages,
		gateway: gateway
	}

	return (
		<ChannelsContext.Provider value={context_value} >
			{children}
		</ChannelsContext.Provider>
	)
}
