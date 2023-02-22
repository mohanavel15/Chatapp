import { ChannelContext, ChannelsContext } from '../contexts/channelctx';
import { ContextMenu } from '../contexts/context_menu_ctx';
import { useContext, useEffect, useState } from 'react';
import { ChannelOBJ } from '../models/models';
import ChannelList from './channel_list';
import { useLocation } from 'react-router-dom';
import SideBarHeader from './SideBarHeader';

function SideBar() {
	const [channels_element, setChannels_element] = useState<JSX.Element[]>([])
	const channel_context: ChannelContext = useContext(ChannelsContext);
	const ctx_menu = useContext(ContextMenu);
	const location = useLocation()

	useEffect(() => {
		setChannels_element([])
		function sortChannel(a: ChannelOBJ, b: ChannelOBJ) {
			const a_msg = channel_context.messages.get(a.id)
			const b_msg = channel_context.messages.get(b.id)
			if (a_msg && b_msg) {
				const a_msgs = Array.from(a_msg.values()).sort((a, b) => { return a.created_at - b.created_at; });
				const b_msgs = Array.from(b_msg.values()).sort((a, b) => { return a.created_at - b.created_at; });
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

		const channels = Array.from(channel_context.channels.values()).sort(sortChannel)

		channels.forEach(channel => {
			setChannels_element(prevElement => [...prevElement,
			<div key={channel.id} onContextMenu={(event) => {
				event.preventDefault();
				ctx_menu.closeAll();
				ctx_menu.setChannelCtxMenu({ x: event.clientX, y: event.clientY, channel: channel })
				ctx_menu.setShowChannelCtxMenu(true);
			}}>
				<ChannelList channel={channel} />
			</div>
			])
		})
	}, [channel_context.channels, channel_context.messages])

	return (
		<div className={`h-full w-full lg:w-64 ${location.pathname !== "/channels" ? "hidden" : "block"} overflow-y-scroll lg:block md:border-r border-zinc-800`}>
			<SideBarHeader />
			{channels_element}
		</div>
	);
}
export default SideBar;