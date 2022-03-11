import React, { useEffect, useState } from 'react'
import ChannelList from './channel_list'
import axios from 'axios'
import { Channel } from '../models/models'

export default function ChannelBar() {

	let [channels, setChannels] = useState<Channel[]>([])

  	useEffect(() => {
		axios.get<Channel[]>('http://127.0.0.1:5000/users/@me/channels', {
			headers: {
				Authorization: localStorage.getItem("access_token") || ""
			}
		}).then(res => {
			console.log(res.data)
			res.data.forEach(channel => {
				setChannels(prevChannels => [...prevChannels, channel])
			})
			//channels = res.data.map(channel => 
			//	<ChannelList id={channel.uuid} icon={channel.icon} name={channel.name} />
			//)
		})
    }, [])

	const channels_element = channels.map(channel =>
		<ChannelList id={channel.uuid} icon={channel.icon} name={channel.name} />
	)

	return (
		<div className='ChannelBar'>
			{channels_element}
		</div>
	)
}
