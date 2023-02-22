import { Outlet } from "react-router-dom";
import { useContext, useEffect } from "react";
import SideBar from "../components/sidebar";
import { ContextMenu } from "../contexts/context_menu_ctx";

function Channel() {
	const ctx_menu = useContext(ContextMenu);

	useEffect(() => {
		const handleClick = () => { 
			ctx_menu.closeAll();
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
					{ state_context.editChannel && <EditChannel /> }
					{ state_context.deleteChannel && <DeleteChannel /> }
					{ state_context.deleteMessage && <DeleteMessage /> }
					{ state_context.showKickBan && <KickBan /> }
				</>
			*/}
		</div>
	);
}
export default Channel;