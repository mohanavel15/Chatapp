import React, { createContext } from 'react'
import { ChannelOBJ, MessageOBJ } from '../models/models'
import useDoubleMap from '../hooks/useDoubleMap';
import useMap from '../hooks/useMap';

export interface ChannelContext {
	channels: Map<String,ChannelOBJ>;
	setChannel: React.Dispatch<React.SetStateAction<Map<String, ChannelOBJ>>>
	deleteChannel: (key: String) => void
	
	messages: Map<String, Map<String, MessageOBJ>>;
	UpdateMessage: (key1: String, key2: String, value_: MessageOBJ) => void
	DeleteMessage: (key1: String, key2: String) => void

	pinnedMessages: Map<String, Map<String, MessageOBJ>>;
	UpdatePinnedMessage: (key1: String, key2: String, value_: MessageOBJ) => void
	DeletePinnedMessage: (key1: String, key2: String) => void
}

export const ChannelsContext = createContext<ChannelContext>(undefined!);

export default function ChannelCTX({ children }: {children: React.ReactChild}) {
	const [channels, setChannel, deleteChannel] = useMap<ChannelOBJ>(new Map<String, ChannelOBJ>())
	const [messages, UpdateMessage, DeleteMessage] = useDoubleMap<MessageOBJ>(new Map<String, Map<String, MessageOBJ>>());
	const [pinnedMessages, UpdatePinnedMessage, DeletePinnedMessage] = useDoubleMap<MessageOBJ>(new Map<String, Map<String, MessageOBJ>>());

	const context_value: ChannelContext = {
		channels: channels,
		setChannel: setChannel,
		deleteChannel: deleteChannel,
		messages: messages,
		UpdateMessage: UpdateMessage,
		DeleteMessage: DeleteMessage,
		pinnedMessages: pinnedMessages,
		UpdatePinnedMessage: UpdatePinnedMessage,
		DeletePinnedMessage: DeletePinnedMessage,
	}

	return (
		<ChannelsContext.Provider value={context_value} >
			{children}
		</ChannelsContext.Provider>
	)
}
