import { useContext, useMemo } from 'react'
import Channel from './Channel'
import { ChannelsContext, ChannelContext } from '../../contexts/channelctx';
import { ContextMenuCtx, ContextMenu } from "../../contexts/context_menu_ctx";
import { ChannelOBJ } from '../../models/models';

export default function ChannelList() {
	const channel_context: ChannelContext = useContext(ChannelsContext);
	const ctx_menu_context: ContextMenuCtx = useContext(ContextMenu);
	const channels = useMemo(() => Array.from(channel_context.channels.values()).sort((a: ChannelOBJ, b: ChannelOBJ) => sortChannel(a, b, channel_context)), [channel_context.channels, channel_context.messages])

	return (
		<div className='flex flex-col h-full overflow-scroll'>
			{ channels.map(channel => (
			<div key={channel.id} onContextMenu={event => {
				event.preventDefault();
				ctx_menu_context.closeAll();
				ctx_menu_context.setChannelCtxMenu({x: event.clientX, y: event.clientY, channel: channel})
				ctx_menu_context.setShowChannelCtxMenu(true);
				}}>
			<Channel channel={channel} />
			</div>
			))}
		</div>
	)
}

function sortChannel(a: ChannelOBJ, b: ChannelOBJ, channel_context: ChannelContext) {
	const a_msg = channel_context.messages.get(a.id)
	const b_msg = channel_context.messages.get(b.id)
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