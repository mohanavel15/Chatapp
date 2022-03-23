import React, { useEffect, useState, useContext } from 'react'
import ChannelList from './channel_list'
import { ChannelsContext, ChannelContext } from '../contexts/channelctx';

export default function ChannelBar() {
	let [channels_element, setChannels_element] = useState<JSX.Element[]>([])
	const channel_context: ChannelContext = useContext(ChannelsContext);

	useEffect(() => {
		setChannels_element([])
		const channels =  Array.from(channel_context.channels.values())
		channels.forEach(channel => {
			setChannels_element(prevElement => [...prevElement, <ChannelList key={channel.uuid} id={channel.uuid} icon={channel.icon} name={channel.name} />])
		})
	}, [channel_context.channelsLoaded])

	return (
		<div className='ChannelBar'>
			{channels_element}
		</div>
	)
}