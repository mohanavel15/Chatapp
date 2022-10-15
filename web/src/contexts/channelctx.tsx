import React, { createContext, useState } from 'react'
import { ChannelOBJ, MessageOBJ } from '../models/models'
import useMap from '../hooks/useMap';

export interface ChannelContext {
	channels: Map<String,ChannelOBJ>;
	setChannel: React.Dispatch<React.SetStateAction<Map<String, ChannelOBJ>>>
	deleteChannel: (key: String) => void
	
	messages: Map<String, MessageOBJ[]>;
	InsertMessage: (message: MessageOBJ) => void
	UpdateMessage: (message: MessageOBJ) => void
	DeleteMessage: (message: MessageOBJ) => void

	pinnedMessages: Map<String, MessageOBJ[]>;
	InsertPinnedMessage: (message: MessageOBJ) => void
	UpdatePinnedMessage: (message: MessageOBJ) => void
	DeletePinnedMessage: (message: MessageOBJ) => void
}

export const ChannelsContext = createContext<ChannelContext>(undefined!);

export default function ChannelCTX({ children }: {children: React.ReactChild}) {
	const [channels, setChannel, deleteChannel] = useMap<ChannelOBJ>(new Map<String, ChannelOBJ>())
	
	const [messages, setMessages] = useState(new Map<String, MessageOBJ[]>());
	const [pinnedMessages, setPinnedMessages] = useState(new Map<String, MessageOBJ[]>());

	const InsertMessage = (message: MessageOBJ) => {
		setMessages(p => {
			let messages = p.get(message.channel_id)
			if (!messages) {
				messages = [] as MessageOBJ[]
			}

			messages.push(message)

			p.set(message.channel_id, messages)

			return new Map<String, MessageOBJ[]>(p)
		})
	}

	const UpdateMessage = (message: MessageOBJ) => {
		setMessages(p => {
			const messages = p.get(message.channel_id)
			if (!messages) {
				return p
			}
			for (let i = 0; i < messages.length; i++) {
				if (messages[i].id === message.id) {
					messages[i] = message
					break
				}
			}

			p.set(message.channel_id, messages)
			return new Map<String, MessageOBJ[]>(p)
		})
	}

	const DeleteMessage = (message: MessageOBJ) => {
		setMessages(p => {
			const messages = p.get(message.channel_id)
			if (!messages) {
				return p
			}

			for (let i = 0; i < messages.length; i++) {
				if (messages[i].id === message.id) {
					messages.splice(i, 1)
					break
				}
			}

			p.set(message.channel_id, messages)
			return new Map<String, MessageOBJ[]>(p)
		})
	}

	const InsertPinnedMessage = (message: MessageOBJ) => {
		setPinnedMessages(p => {
			let messages = p.get(message.channel_id)
			if (!messages) {
				messages = [] as MessageOBJ[]
			}

			messages.push(message)

			p.set(message.channel_id, messages)

			return new Map<String, MessageOBJ[]>(p)
		})
	}

	const UpdatePinnedMessage = (message: MessageOBJ) => {
		setPinnedMessages(p => {
			const messages = p.get(message.channel_id)
			if (!messages) {
				return p
			}

			for (let i = 0; i < messages.length; i++) {
				if (messages[i].id === message.id) {
					messages[i] = message
					break
				}
			}

			p.set(message.channel_id, messages)
			return new Map<String, MessageOBJ[]>(p)
		})
	}

	const DeletePinnedMessage = (message: MessageOBJ) => {
		setPinnedMessages(p => {
			const messages = p.get(message.channel_id)
			if (!messages) {
				return p
			}

			for (let i = 0; i < messages.length; i++) {
				if (messages[i].id === message.id) {
					messages.splice(i, 1)
					break
				}
			}

			p.set(message.channel_id, messages)
			return new Map<String, MessageOBJ[]>(p)
		})
	}

	const context_value: ChannelContext = {
		channels: channels,
		setChannel: setChannel,
		deleteChannel: deleteChannel,
		messages: messages,
		InsertMessage: InsertMessage,
		UpdateMessage: UpdateMessage,
		DeleteMessage: DeleteMessage,
		pinnedMessages: pinnedMessages,
		InsertPinnedMessage: InsertPinnedMessage,
		UpdatePinnedMessage: UpdatePinnedMessage,
		DeletePinnedMessage: DeletePinnedMessage,
	}

	return (
		<ChannelsContext.Provider value={context_value} >
			{children}
		</ChannelsContext.Provider>
	)
}
