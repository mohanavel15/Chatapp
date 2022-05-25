import { useEffect, useState, useContext } from 'react'
import ChannelList from './channel_list'
import { ChannelsContext, ChannelContext } from '../contexts/channelctx';
import { ContextMenuCtx, ContextMenu } from "../contexts/context_menu_ctx";
import { ChannelOBJ } from '../models/models';

export default function ChannelBar() {
	let [channels_element, setChannels_element] = useState<JSX.Element[]>([])
	const channel_context: ChannelContext = useContext(ChannelsContext);
	const ctx_menu_context: ContextMenuCtx = useContext(ContextMenu);

	useEffect(() => {
		setChannels_element([])
		function sortChannel(a: ChannelOBJ, b: ChannelOBJ) {
			const a_msg = channel_context.messages.get(a.uuid)
			const b_msg = channel_context.messages.get(b.uuid)
			if (a_msg && b_msg) {
				const a_msgs = Array.from(a_msg.values()).sort((a, b) => { return a.created_at - b.created_at;});
				const b_msgs = Array.from(b_msg.values()).sort((a, b) => { return a.created_at - b.created_at;});
				if (a_msgs.length > 0 && b_msgs.length > 0) {
					return b_msgs[b_msgs.length - 1].created_at - a_msgs[a_msgs.length - 1].created_at;
				} else if (a_msgs.length > 0) {
					return -1;
				} else if (b_msgs.length > 0) {
					return 1;
				} else {
					return 0;
				}
			} else if (a_msg) {
				return -1
			} else if (b_msg) {
				return 1
			} else {
				return 0
			}
		}

		const channels =  Array.from(channel_context.channels.values()).sort(sortChannel)
		
		channels.forEach(channel => {
			setChannels_element(prevElement => [...prevElement, 
				<div key={channel.uuid} onContextMenu={(event) => {
					event.preventDefault();
					ctx_menu_context.closeAll();
					ctx_menu_context.setChannelCtxMenu({x: event.clientX, y: event.clientY, channel: channel})
					ctx_menu_context.setShowChannelCtxMenu(true);
				}}>
				{ channel.type === 1  && <ChannelList id={channel.uuid} icon={channel.icon} name={channel.name} status={0} dm={false} /> }
				{ channel.type === 0  && <ChannelList id={channel.uuid} icon={channel.recipient.avatar} name={channel.recipient.username} status={channel.recipient.status} dm={true} /> }
				</div>
		])
		})
	}, [channel_context.channels, channel_context.messages])

	return (
		<div className='ChannelBar'>
			{channels_element}
		</div>
	)
}