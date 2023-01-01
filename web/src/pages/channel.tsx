import { Outlet, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { IMessageEvent } from "websocket";

import { MessageOBJ, ChannelOBJ, ReadyOBJ, Status } from "../models/models";
import { Relationship as RelationshipOBJ  } from "../models/relationship";
import Settings from "./settings"; 

import SideBar from "../components/sidebar";
import MembersBar from "../components/members_bar";

import CreateChannel from "../components/createchannel";
import EditChannel from '../components/editchannel';
import DeleteChannel from "../components/deletechannel";
import DeleteMessage from "../components/deletemessage";
import KickBan from "../components/kick_ban";

import MessageContextMenu from '../contextmenu/message_context_menu';
import ChannelContextMenu from "../contextmenu/channel_context_menu";
import MemberContextMenu from "../contextmenu/member_context_menu";
import FriendContextMenu from "../contextmenu/friend_context_menu";

import { UserContextOBJ, UserContext } from "../contexts/usercontext";
import { ContextMenuCtx, ContextMenu } from "../contexts/context_menu_ctx";
import { StatesContext, StateContext } from "../contexts/states";
import { ChannelsContext, ChannelContext } from "../contexts/channelctx";
import ChannelHome from "../components/channel_home";
import MessageCTX from '../contexts/messagectx';
import Routes from '../config';
import { Refresh } from "../utils/api";
import { GetMessages } from "../api/message";
import { GetPinnedMessages } from "../api/pinned_msgs"
import NavBar from "../components/NavBar";
import Relationship from "../components/Relationships";
import ChatScreen from "../components/ChatScreen";

function Channel() {
	const [screen, setScreen] = useState<0 | 1>(1)

    const user_ctx:UserContextOBJ = useContext(UserContext);
	const state_context: StateContext = useContext(StatesContext);
	const channel_context: ChannelContext = useContext(ChannelsContext);
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
			{ !state_context.Settings && 
					<MessageCTX>
					<>
						<SideBar />
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
					</MessageCTX>
			}
			{ state_context.Settings && <Settings /> } */}
		</div>
	);
}
export default Channel;