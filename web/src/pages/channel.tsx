import SideBar from "../components/sidebar";
import Chat from "../components/chat";
import { useParams } from "react-router-dom";
import { useContext, useEffect } from "react";
import { StatesContext, StateContext } from "../contexts/states";
import { ChannelsContext, ChannelContext } from "../contexts/channelctx";
import Settings from "./settings"; 
import { MessageOBJ, ChannelOBJ, MemberOBJ } from "../models/models";
import { IMessageEvent } from "websocket";
import MembersBar from "../components/members_bar";
import CreateChannel from "../components/createchannel";
import EditChannel from '../components/editchannel';
import DeleteChannel from "../components/deletechannel";
import DeleteMessage from "../components/deletemessage";
import { ContextMenuCtx, ContextMenu } from "../contexts/context_menu_ctx";
import MessageContextMenu from '../contextmenu/message_context_menu';
import ChannelContextMenu from "../contextmenu/channel_context_menu";
import MemberContextMenu from "../contextmenu/member_context_menu";

function Channel() {
	const parameter  = useParams<string>();
	let channel_id = parameter.id || "@me";

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
					localStorage.setItem('profile-uuid', payload.data.uuid);
					localStorage.setItem('profile-username', payload.data.username);
					localStorage.setItem('profile-avatar', payload.data.avatar);
				}

				if (payload.event === 'INVAILD_SESSION') {
					localStorage.removeItem('access_token');
					window.location.href = '/';
				}

				if (payload.event === 'MESSAGE_CREATE') {
					const message: MessageOBJ = payload.data;
					const update_message = (prevMessages: Map<String, Map<String, MessageOBJ>>) => {
						let channel_messages = prevMessages.get(message.channel.uuid);
						if (!channel_messages) {
							channel_messages = new Map<String, MessageOBJ>();
						}
						channel_messages.set(message.uuid, message);
						prevMessages.set(message.channel.uuid, new Map(channel_messages));
						return prevMessages;
					}
					channel_context.setMessages(prevMessages => new Map(update_message(prevMessages)));
				}

				if (payload.event === 'MESSAGE_DELETE') {
					const message: MessageOBJ = payload.data;
					const update_message = (prevMessages: Map<String, Map<String, MessageOBJ>>) => {
						let channel_messages = prevMessages.get(message.channel.uuid);
						if (!channel_messages) {
							channel_messages = new Map<String, MessageOBJ>();
						}
						channel_messages.delete(message.uuid);
						prevMessages.set(message.channel.uuid, new Map(channel_messages));
						return prevMessages;
					}
					channel_context.setMessages(prevMessages => new Map(update_message(prevMessages)));
				}


				if (payload.event === 'CHANNEL_CREATE') {
					const channel: ChannelOBJ = payload.data;
					channel_context.setChannels(prevChannels => new Map(prevChannels.set(channel.uuid, channel)));
				}

				if (payload.event === 'CHANNEL_MODIFY') {
					const channel: ChannelOBJ = payload.data;
					channel_context.setChannels(prevChannels => new Map(prevChannels.set(channel.uuid, channel)));
				}

				if (payload.event === 'CHANNEL_DELETE') {
					const deleted_channel = (prevChannels: Map<String, ChannelOBJ>) => {
						const new_channels = new Map(prevChannels);
						new_channels.delete(payload.data.uuid);
						return new_channels;
					}
					channel_context.setChannels(prevChannels => deleted_channel(prevChannels));
				}

				if (payload.event === 'MEMBER_UPDATE') {
					const member: MemberOBJ = payload.data;
					const update_member = (prevMembers: Map<String, Map<String, MemberOBJ>>) => {
						let channel = prevMembers.get(member.channel_id);
						if (!channel) {
							channel = new Map<String, MemberOBJ>();
						}
						channel.set(member.uuid, member);
						const members = prevMembers.set(member.channel_id, new Map(channel));
						return members;
					}

					channel_context.setMembers(prevMembers => new Map(update_member(prevMembers)));
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
			ctx_menu_context.setShowMsgCtxMenu(false);
			ctx_menu_context.setShowChannelCtxMenu(false);
			ctx_menu_context.setShowMemberCtxMenu(false);
		};
		window.addEventListener('click', handleClick);
		return () => window.removeEventListener('click', handleClick);
	}, []);

	return (
		<div className="Channel">
			{ !state_context.Settings && 
					<>
						<SideBar />
						<Chat channel={currentChannel} />
						<MembersBar channel={currentChannel} />
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