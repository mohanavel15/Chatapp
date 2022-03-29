import { useParams } from "react-router-dom";
import { useContext, useEffect } from "react";
import { IMessageEvent } from "websocket";

import { MessageOBJ, ChannelOBJ, MemberOBJ, UserOBJ } from "../models/models";
import Settings from "./settings"; 

import SideBar from "../components/sidebar";
import Chat from "../components/chat";
import MembersBar from "../components/members_bar";

import CreateChannel from "../components/createchannel";
import EditChannel from '../components/editchannel';
import DeleteChannel from "../components/deletechannel";

import DeleteMessage from "../components/deletemessage";

import MessageContextMenu from '../contextmenu/message_context_menu';
import ChannelContextMenu from "../contextmenu/channel_context_menu";
import MemberContextMenu from "../contextmenu/member_context_menu";

import { UserContextOBJ, UserContext } from "../contexts/usercontext";
import { ContextMenuCtx, ContextMenu } from "../contexts/context_menu_ctx";
import { StatesContext, StateContext } from "../contexts/states";
import { ChannelsContext, ChannelContext } from "../contexts/channelctx";

const add_or_update_message = (messages: Map<String, Map<String, MessageOBJ>>, message: MessageOBJ) => {
	let channel = messages.get(message.channel.uuid);
	if (!channel) {
		channel = new Map<String, MessageOBJ>();
	}
	channel.set(message.uuid, message);
	messages.set(message.channel.uuid, new Map(channel));
	return messages;
}

const delete_message = (messages: Map<String, Map<String, MessageOBJ>>, message: MessageOBJ) => {
	let channel = messages.get(message.channel.uuid);
	if (!channel) {
		channel = new Map<String, MessageOBJ>();
	}
	channel.delete(message.uuid);
	messages.set(message.channel.uuid, new Map(channel));
	return messages;
}

const delete_channel = (channels: Map<String, ChannelOBJ>, channel: ChannelOBJ) => {
	channels.delete(channel.uuid);
	return channels;
}

const add_or_update_member = (members: Map<String, Map<String, MemberOBJ>>, member: MemberOBJ) => {
	let channel = members.get(member.channel_id);
	if (!channel) {
		channel = new Map<String, MemberOBJ>();
	}
	channel.set(member.uuid, member);
	members.set(member.channel_id, new Map(channel));
	return members;
}

const delete_member = (members: Map<String, Map<String, MemberOBJ>>, member: MemberOBJ) => {
	let channel = members.get(member.channel_id);
	if (!channel) {
		channel = new Map<String, MemberOBJ>();
	}
	channel.delete(member.uuid);
	members.set(member.channel_id, new Map(channel));
	return members;
}

function Channel() {
	const parameter  = useParams<string>();
	let channel_id = parameter.id || "@me";

    const user_ctx:UserContextOBJ = useContext(UserContext);
	const state_context: StateContext = useContext(StatesContext);
	const channel_context: ChannelContext = useContext(ChannelsContext);
	const ctx_menu_context: ContextMenuCtx = useContext(ContextMenu);

	useEffect(() => {
		const onMessage = (message: IMessageEvent) => {
			console.log(message);
			const data = message.data;
			if (typeof data === "string") {
				const payload = JSON.parse(data);
				if (payload.event === 'READY') {
					const user: UserOBJ = payload.data;
					user_ctx.setUuid(user.uuid);
					user_ctx.setUsername(user.username);
					user_ctx.setAvatar(user.avatar);
				}

				if (payload.event === 'INVAILD_SESSION') {
					localStorage.removeItem('access_token');
					window.location.href = '/';
				}

				if (payload.event === 'MESSAGE_CREATE' || payload.event === 'MESSAGE_MODIFY') {
					const message: MessageOBJ = payload.data;
					channel_context.setMessages(prevMessages => new Map(add_or_update_message(prevMessages, message)));
				}

				if (payload.event === 'MESSAGE_DELETE') {
					const message: MessageOBJ = payload.data;
					channel_context.setMessages(prevMessages => new Map(delete_message(prevMessages, message)));
				}

				if (payload.event === 'CHANNEL_CREATE' || payload.event === 'CHANNEL_MODIFY') {
					const channel: ChannelOBJ = payload.data;
					channel_context.setChannels(prevChannels => new Map(prevChannels.set(channel.uuid, channel)));
				}

				if (payload.event === 'CHANNEL_DELETE') {
					const channel: ChannelOBJ = payload.data;
					channel_context.setChannels(prevChannels => delete_channel(prevChannels, channel));
				}

				if (payload.event === 'MEMBER_JOIN' || payload.event === 'MEMBER_UPDATE') {
					const member: MemberOBJ = payload.data;
					channel_context.setMembers(prevMembers => new Map(add_or_update_member(prevMembers, member)));
				}
			}
		};
	
		const onOpen = () => {
			console.log("Connecting to the server");
			channel_context.gateway.send(
				JSON.stringify({
					event: "CONNECT",
					data: { token: localStorage.getItem("access_token") }
				})
			);
		};
	
		const onClose = () => {
			console.log("Disconnected from server");
		};
	
		channel_context.gateway.onopen = onOpen;
		channel_context.gateway.onclose = onClose;
	  	channel_context.gateway.onmessage = onMessage;
  
		return () => {
			channel_context.gateway.close();
		};
	}, []);

	let currentChannel = channel_context.channels.get(channel_id);
	if (!currentChannel) {
		currentChannel = { uuid: "@me", name: "@me",icon: "", owner_id: "", created_at: "", updated_at: ""};
	}

	useEffect(() => {
		const handleClick = () => { 
			ctx_menu_context.closeAll();
		};
		window.addEventListener('click', handleClick);
		return () => window.removeEventListener('click', handleClick);
	}, []);

	return (
		<div className="Channel">
			{ !state_context.Settings && 
					<>
						<SideBar />
						{ currentChannel.uuid !== "@me" &&
							<>
								<Chat channel={currentChannel} />
								<MembersBar channel={currentChannel} />
							</>
						}
						{ state_context.createChannel && <CreateChannel /> }
						{ state_context.editChannel && <EditChannel /> }
						{ state_context.deleteChannel && <DeleteChannel /> }
						{ state_context.deleteMessage && <DeleteMessage /> }
						{ ctx_menu_context.showMsgCtxMenu && <MessageContextMenu location={ctx_menu_context.ctxMsgMenuLocation} /> }
						{ ctx_menu_context.showChannelCtxMenu && <ChannelContextMenu location={ctx_menu_context.ctxChannelMenuLocation} /> }
						{ ctx_menu_context.showMemberCtxMenu && <MemberContextMenu location={ctx_menu_context.ctxMemberMenuLocation} /> }
					</>
			}
			{ state_context.Settings && <Settings /> }

		</div>
	);
}
export default Channel;