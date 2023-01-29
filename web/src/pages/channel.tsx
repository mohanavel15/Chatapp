import { Outlet } from "react-router-dom";
import { useContext, useEffect } from "react";

import SideBar from "../components/sidebar";
import { ContextMenuCtx, ContextMenu } from "../contexts/context_menu_ctx";

function Channel() {
	const ctx_menu_context: ContextMenuCtx = useContext(ContextMenu);

	useEffect(() => {
		const handleClick = () => { 
			ctx_menu_context.closeAll();
		};
		window.addEventListener('click', handleClick);
		return () => window.removeEventListener('click', handleClick);
	}, []);

	return (
		<div className="h-screen w-full flex flex-col-reverse md:flex-row">
			<SideBar />
			<Outlet />
			{/*
				<>
					{ currentChannel.id !== "@me" && state_context.editChannel !== true &&
						<>
							<Chat channel_id={currentChannel.id} />
							{ state_context.showMembers && currentChannel.type === 2 && <MembersBar channel={currentChannel} /> }
						</>
					}
					{ currentChannel.id === "@me" && !state_context.editChannel && <ChannelHome /> }
					{ state_context.createChannel && <CreateChannel /> }
					{ state_context.editChannel && <EditChannel /> }
					{ state_context.deleteChannel && <DeleteChannel /> }
					{ state_context.deleteMessage && <DeleteMessage /> }
					{ state_context.showKickBan && <KickBan /> }
					{ ctx_menu_context.showMsgCtxMenu && <MessageContextMenu {...ctx_menu_context.msgCtxMenu} /> }
					{ ctx_menu_context.showChannelCtxMenu && <ChannelContextMenu {...ctx_menu_context.channelCtxMenu} /> }
					{ ctx_menu_context.showMemberCtxMenu && <MemberContextMenu {...ctx_menu_context.memberCtxMenu} /> }
					{ ctx_menu_context.showFriendCtxMenu && <FriendContextMenu {...ctx_menu_context.friendCtxMenu} /> }
				</>
			*/}
		</div>
	);
}
export default Channel;