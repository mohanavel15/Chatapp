import React, { useEffect, useState, useContext } from 'react'
import ChannelList from './channel_list'
import axios from 'axios'
import { ChannelOBJ } from '../models/models'
import { ChannelsContext, ChannelContext } from '../contexts/channelctx';

export default function ChannelBar() {
	let [channels_element, setChannels_element] = useState<JSX.Element[]>([])
	const channel_context: ChannelContext = useContext(ChannelsContext);
	/*useEffect(() => {
		axios.get<ChannelOBJ[]>('http://127.0.0.1:5000/users/@me/channels', {
			headers: {
				Authorization: localStorage.getItem("access_token") || ""
			}
		}).then(res => {
			console.log(res.data)
			res.data.forEach(channel => {
				channel_context.setChannels(channel_context.channels.set(channel.uuid, channel))
				console.log(channel_context.channels)
			})
		})
    }, [])*/

	useEffect(() => {
		setChannels_element([])
		const channels =  Array.from(channel_context.channels.values())
		console.log("In useEffect channels: ", channels)
		channels.forEach(channel => {
			setChannels_element(prevElement => [...prevElement, <ChannelList key={channel.uuid} id={channel.uuid} icon={channel.icon} name={channel.name} />])
		})
	}, [channel_context.channels, channel_context.setChannels])

	return (
		<div className='ChannelBar'>
			{channels_element}
		</div>
	)
}
