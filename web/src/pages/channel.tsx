import { useParams } from "react-router-dom";
import { useContext, useEffect } from "react";
import { IMessageEvent } from "websocket";

import { MessageOBJ, ChannelOBJ, ReadyOBJ, Status } from "../models/models";
import { Relationship } from "../models/relationship";
import Settings from "./settings"; 

import SideBar from "../components/sidebar";
import Chat from "../components/chat";
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

function Channel() {
	const parameter  = useParams<string>();
	let channel_id = parameter.id || "@me";

    const user_ctx:UserContextOBJ = useContext(UserContext);
	const state_context: StateContext = useContext(StatesContext);
	const channel_context: ChannelContext = useContext(ChannelsContext);
	const ctx_menu_context: ContextMenuCtx = useContext(ContextMenu);

	useEffect(() => {
		const NewGateway = () => {
			const gateway = new WebSocket(Routes.ws);
			gateway.onopen = () => {
				console.log("Connecting to the server");
				gateway.send(
					JSON.stringify({
						event: "CONNECT",
						data: { token: localStorage.getItem("access_token") }
					})
				);
			}
			return gateway;
		}

		let gateway = NewGateway();

		const onMessage = (message: IMessageEvent) => {
			console.log(message);
			const data = message.data;
			if (typeof data === "string") {
				const payload = JSON.parse(data);
				if (payload.event === 'READY') {
					const ready: ReadyOBJ = payload.data;
					user_ctx.setId(ready.user.id);
					user_ctx.setUsername(ready.user.username);
					user_ctx.setAvatar(ready.user.avatar);

					ready.channels.forEach((channel: ChannelOBJ) => {
						channel_context.setChannel(prev => new Map(prev.set(channel.id, channel)));
						const url = Routes.Channels+`/${channel.id}/messages`
						fetch(url, {
							method: "GET",
							headers: {
								"Authorization": localStorage.getItem("access_token") || ""
							}
						}).then(response => {
							if (response.status === 200) {
								response.json().then((msgs: MessageOBJ[]) => {
									msgs.forEach(msg => channel_context.UpdateMessage(channel.id, msg.id, msg))
								})
							}
						})

						const url2 = Routes.Channels+`/${channel.id}/pins`
						fetch(url2, {
							method: "GET",
							headers: {
								"Authorization": localStorage.getItem("access_token") || ""
							}
						}).then(response => {
							if (response.status === 200) {
								response.json().then((msgs: MessageOBJ[]) => {
									msgs.forEach(msg => channel_context.UpdatePinnedMessage(channel.id, msg.id, msg))
								})
							}
						})
					});
				}

				if (payload.event === 'INVAILD_SESSION') {
					Refresh().then(access_token => {
						if (access_token === undefined) {
							localStorage.removeItem('access_token');
							window.location.href = '/';
						} else {
							window.location.reload()
						}
					})
				}

				if (payload.event === 'MESSAGE_CREATE' || payload.event === 'MESSAGE_MODIFY') {
					const message: MessageOBJ = payload.data;
					channel_context.UpdateMessage(message.channel_id, message.id ,message);
				}

				if (payload.event === 'MESSAGE_DELETE') {
					const message: MessageOBJ = payload.data;
					channel_context.DeleteMessage(message.channel_id, message.id);
				}

				if (payload.event === 'CHANNEL_CREATE' || payload.event === 'CHANNEL_MODIFY') {
					const channel: ChannelOBJ = payload.data;
					channel_context.setChannel(prevChannels => new Map(prevChannels.set(channel.id, channel)));
				}

				if (payload.event === 'CHANNEL_DELETE') {
					const channel: ChannelOBJ = payload.data;
					channel_context.deleteChannel(channel.id)
				}

				if (payload.event === 'RELATIONSHIP_CREATE' || payload.event === 'RELATIONSHIP_MODIFY') {
					const relationship: Relationship = payload.data;
					user_ctx.setRelationships(prevRelationship => new Map(prevRelationship.set(relationship.id, relationship)));
				}
				
				if (payload.event === 'RELATIONSHIP_DELETE') {
					const relationship_: Relationship = payload.data;
					user_ctx.deleterelationship(relationship_.id);
				}

				if (payload.event === 'STATUS_UPDATE') {
					const status: Status = payload.data;
					
					if (status.type === 0) {
						const relationship_ = user_ctx.relationships.get(status.user_id);
						if (relationship_ !== undefined) {
							relationship_.status = status.status;
							user_ctx.setRelationships(prevFriends => new Map(prevFriends.set(relationship_.id, relationship_)));
						}
					}
					
					if (status.type === 1) {
						const UpdateChannelStatus = (prevChannels: Map<String, ChannelOBJ>, status: Status) => {
							const channel = prevChannels.get(status.channel_id)
							if (channel !== undefined) {
								for (let i = 0; i < channel.recipients.length; i++) {
									if (channel.recipients[i].id === status.user_id) {
										channel.recipients[i].status = status.status;
										break;
									}
								}
								return prevChannels.set(channel.id, channel)
							} else {
								return prevChannels
							}
						}
						channel_context.setChannel(prevChannels => new Map(UpdateChannelStatus(prevChannels, status)));
					}
				}

				if (payload.event === 'MESSAGE_PINNED') {
					const message: MessageOBJ = payload.data;
					channel_context.UpdatePinnedMessage(message.channel_id, message.id, message);
				}

				if (payload.event === 'MESSAGE_UNPINNED') {
					const message: MessageOBJ = payload.data;
					channel_context.DeletePinnedMessage(message.channel_id, message.id);
				}
			}
		};
		
		const onClose = () => {
			console.log("Disconnected from server");
			gateway = NewGateway();
		};
		
		gateway.onclose = onClose;
	  	gateway.onmessage = onMessage;
  
		return () => {
			gateway.close();
		};
	}, []);

	let currentChannel = channel_context.channels.get(channel_id);
	if (currentChannel === undefined) {
		currentChannel = { id: "@me", name: "@me",icon: "", owner_id: "", type: 0, created_at: "", recipients: [{ id: "@me", username: "@me", avatar: "", status:0, created_at: 0 }]};
	}

	useEffect(() => {
		const handleClick = () => { 
			ctx_menu_context.closeAll();
		};
		window.addEventListener('click', handleClick);
		return () => window.removeEventListener('click', handleClick);
	}, []);

	useEffect(() => {
		state_context.setEditChannel(false);
	}, [channel_id]);

	return (
		<div className="Channel">
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
			{ state_context.Settings && <Settings /> }
		</div>
	);
}
export default Channel;