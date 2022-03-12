import React, { useEffect, useState } from 'react'
import ChannelList from './channel_list'
import axios from 'axios'
import { ChannelOBJ } from '../models/models'

export default function ChannelBar() {

	let [channels, setChannels] = useState<ChannelOBJ[]>([])

  	useEffect(() => {
		axios.get<ChannelOBJ[]>('http://127.0.0.1:5000/users/@me/channels', {
			headers: {
				Authorization: localStorage.getItem("access_token") || ""
			}
		}).then(res => {
			console.log(res.data)
			res.data.forEach(channel => {
				setChannels(prevChannels => [...prevChannels, channel])
			})
		})
    }, [])

	const channels_element = channels.map(channel =>
		<ChannelList key={channel.uuid} id={channel.uuid} icon={channel.icon} name={channel.name} />
	)

	return (
		<div className='ChannelBar'>
			{channels_element}
		</div>
	)
}
