import { useEffect, useState, useContext } from 'react'
import ChannelList from './channel_list'
import { ChannelsContext, ChannelContext } from '../contexts/channelctx';
import { ContextMenuCtx, ContextMenu } from "../contexts/context_menu_ctx";

export default function ChannelBar() {
	let [channels_element, setChannels_element] = useState<JSX.Element[]>([])
	const channel_context: ChannelContext = useContext(ChannelsContext);
	
	const ctx_menu_context: ContextMenuCtx = useContext(ContextMenu);

	useEffect(() => {
		setChannels_element([])
		const channels =  Array.from(channel_context.channels.values())
		channels.forEach(channel => {
			setChannels_element(prevElement => [...prevElement, 
				<div key={channel.uuid} onContextMenu={(event) => {
					event.preventDefault();
					ctx_menu_context.closeAll();
					ctx_menu_context.setChannelCtxMenuLocation({x: event.clientX, y: event.clientY, channel: channel})
					ctx_menu_context.setShowChannelCtxMenu(true);
				}}>
				{ channel.type === 1  && <ChannelList id={channel.uuid} icon={channel.icon} name={channel.name} status={0} dm={false} /> }
				{ channel.type === 0  && <ChannelList id={channel.uuid} icon={channel.recipient.avatar} name={channel.recipient.username} status={channel.recipient.status} dm={true} /> }
				</div>
		])
		})
	}, [channel_context.channels])

	return (
		<div className='ChannelBar'>
			{channels_element}
		</div>
	)
}