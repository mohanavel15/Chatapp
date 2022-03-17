import React, { useEffect, useState, useContext } from 'react'
import ChannelList from './channel_list'
import axios from 'axios'
import { ChannelOBJ } from '../models/models'
import { ChannelsContext, ChannelContext } from '../contexts/channelctx';

export default function ChannelBar() {
	let [channels_element, setChannels_element] = useState<JSX.Element[]>([])
	const channel_context: ChannelContext = useContext(ChannelsContext);

	useEffect(() => {
		setChannels_element([])
		const channels =  Array.from(channel_context.channels.values())
		console.log("In useEffect channels: ", channels)
		channels.forEach(channel => {
			setChannels_element(prevElement => [...prevElement, <ChannelList key={channel.uuid} id={channel.uuid} icon={channel.icon} name={channel.name} />])
		})
	}, [channel_context.channels])

	return (
		<div className='ChannelBar'>
			{channels_element}
		</div>
	)
}