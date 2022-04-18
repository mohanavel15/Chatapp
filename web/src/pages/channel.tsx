import { useParams } from "react-router-dom";
import { useContext, useEffect } from "react";
import { IMessageEvent } from "websocket";

import { MessageOBJ, ChannelOBJ, MemberOBJ, UserOBJ, FriendOBJ, DMChannelOBJ, ReadyOBJ } from "../models/models";
import Settings from "./settings"; 

import SideBar from "../components/sidebar";
import Chat from "../components/chat";
import MembersBar from "../components/members_bar";

import CreateChannel from "../components/createchannel";
import EditChannel from '../components/editchannel';
import DeleteChannel from "../components/deletechannel";
import DeleteMessage from "../components/deletemessage";
import Profile from "../components/profile";

import MessageContextMenu from '../contextmenu/message_context_menu';
import ChannelContextMenu from "../contextmenu/channel_context_menu";
import MemberContextMenu from "../contextmenu/member_context_menu";
import FriendContextMenu from "../contextmenu/friend_context_menu";

import { UserContextOBJ, UserContext } from "../contexts/usercontext";
import { ContextMenuCtx, ContextMenu } from "../contexts/context_menu_ctx";
import { StatesContext, StateContext } from "../contexts/states";
import { ChannelsContext, ChannelContext } from "../contexts/channelctx";
import { CallContext, CallContextOBJ } from "../contexts/callcontexts";
import CallPopUp from "../components/call_pop_up";
import ChannelHome from "../components/channel_home";
import MessageCTX from '../contexts/messagectx';

import { setDefaultAvatar } from '../utils/errorhandle';

const delete_channel = (channels: Map<String, ChannelOBJ>, channel: ChannelOBJ) => {
	channels.delete(channel.uuid);
	return channels;
}

const deleteFriend = (prevFriends: Map<String, FriendOBJ>, friend: FriendOBJ) => {
	prevFriends.delete(friend.uuid);
	return prevFriends;
}

function Channel() {
	const parameter  = useParams<string>();
	let channel_id = parameter.id || "@me";

    const user_ctx:UserContextOBJ = useContext(UserContext);
	const state_context: StateContext = useContext(StatesContext);
	const channel_context: ChannelContext = useContext(ChannelsContext);
	const ctx_menu_context: ContextMenuCtx = useContext(ContextMenu);
    const call_ctx: CallContextOBJ = useContext(CallContext);

	useEffect(() => {
		const onMessage = (message: IMessageEvent) => {
			console.log(message);
			const data = message.data;
			if (typeof data === "string") {
				const payload = JSON.parse(data);
				if (payload.event === 'READY') {
					const ready: ReadyOBJ = payload.data;
					user_ctx.setUuid(ready.user.uuid);
					user_ctx.setUsername(ready.user.username);
					user_ctx.setAvatar(ready.user.avatar);

					ready.channels.forEach((channel: ChannelOBJ) => {
						channel_context.setChannels(prev => new Map(prev.set(channel.uuid, channel)));
					});

					ready.dm_channels.forEach((dm_channel: DMChannelOBJ) => {
						channel_context.setDMChannels(prev => new Map(prev.set(dm_channel.uuid, dm_channel)));
					});

					ready.friends.forEach((friend: FriendOBJ) => {
						user_ctx.setFriends(prev => new Map(prev.set(friend.uuid, friend)));
					});
				}

				if (payload.event === 'INVAILD_SESSION') {
					localStorage.removeItem('access_token');
					window.location.href = '/';
				}

				if (payload.event === 'MESSAGE_CREATE' || payload.event === 'MESSAGE_MODIFY') {
					const message: MessageOBJ = payload.data;
					channel_context.UpdateMessage(message.channel_id, message.uuid ,message);
				}

				if (payload.event === 'MESSAGE_DELETE') {
					const message: MessageOBJ = payload.data;
					channel_context.DeleteMessage(message.channel_id, message.uuid);
				}

				if (payload.event === 'CHANNEL_CREATE' || payload.event === 'CHANNEL_MODIFY') {
					const channel: ChannelOBJ = payload.data;
					channel_context.setChannels(prevChannels => new Map(prevChannels.set(channel.uuid, channel)));
				}

				if (payload.event === 'CHANNEL_DELETE') {
					const channel: ChannelOBJ = payload.data;
					channel_context.setChannels(prevChannels => new Map(delete_channel(prevChannels, channel)));
				}

				if (payload.event === 'DM_CHANNEL_CREATE' || payload.event === 'DM_CHANNEL_MODIFY') {
					const channel: DMChannelOBJ = payload.data;
					channel_context.setDMChannels(prevChannels => new Map(prevChannels.set(channel.uuid, channel)));
				}

				if (payload.event === 'MEMBER_JOIN' || payload.event === 'MEMBER_UPDATE') {
					const member: MemberOBJ = payload.data;
					channel_context.UpdateMember(member.channel_id, member.uuid, member);
				}

				if (payload.event === 'MEMBER_REMOVE') {
					const member: MemberOBJ = payload.data;
					channel_context.DeleteMember(member.channel_id, member.uuid);
				}

				if (payload.event === 'FRIEND_CREATE' || payload.event === 'FRIEND_MODIFY') {
					const friend: FriendOBJ = payload.data;
					user_ctx.setFriends(prevFriends => new Map(prevFriends.set(friend.uuid, friend)));
				}
				
				if (payload.event === 'FRIEND_DELETE') {
					const friend: FriendOBJ = payload.data;
					user_ctx.setFriends(prevFriends => new Map(deleteFriend(prevFriends, friend)));
				}

				if (payload.event === 'CALL_START') {
					console.log('call started');
					const channel_id = payload.data.channel_id;
					const channel = channel_context.DMChannels.get(channel_id);
					if (channel) {
						call_ctx.setUsers(prevUsers => [...prevUsers, 
							<div key={channel.recipient.uuid}>
								{ call_ctx.video === false && <><img id="local-voice" className='user-call-avatar' src={channel.recipient.avatar} alt="Avatar" onError={setDefaultAvatar} /></> }
                				{ call_ctx.video && <video id="remote-video" className='user-call-video-box' autoPlay playsInline></video> }
							</div>
						])
						call_ctx.setChannel(channel);
						call_ctx.setRemoteSDP(new RTCSessionDescription(payload.data.sdp));
						call_ctx.setIncoming(true)
						setTimeout(() => {
							call_ctx.setIncoming(false)
						}, 60000);
					}
				}

				if (payload.event === 'CALL_ANSWER') {
						const user = channel_context.DMChannels.get(payload.data.channel_id);
						call_ctx.setUsers(prevUsers => [...prevUsers, 
							<div key={user?.recipient.uuid}>
								{ call_ctx.video === false && <><img id="local-voice" className='user-call-avatar' src={user?.recipient.avatar} alt="Avatar" onError={setDefaultAvatar} /></> }
                				{ call_ctx.video && <video id="remote-video" className='user-call-video-box' autoPlay playsInline></video> }
							</div>
						])
						console.log("users: ", call_ctx.users);
						console.log('got answer');
						let answer = new RTCSessionDescription(payload.data.sdp)
						call_ctx.setRemoteSDP(answer);
					
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
			setTimeout(function() {
				window.location.reload()
			}, 5000);
		};
	
		channel_context.gateway.onopen = onOpen;
		channel_context.gateway.onclose = onClose;
	  	channel_context.gateway.onmessage = onMessage;
  
		return () => {
			channel_context.gateway.close();
		};
	}, []);

	let dm: boolean = true;
	let dm_channel: DMChannelOBJ | undefined;

	dm_channel = channel_context.DMChannels.get(channel_id);
	if (dm_channel === undefined) {
		dm = false;
		dm_channel = { uuid: "@me", recipient: { uuid: "@me", username: "@me", avatar: "", status:0, created_at: 0 } };
	}

	let currentChannel = channel_context.channels.get(channel_id);
	if (currentChannel === undefined) {
		currentChannel = { uuid: "@me", name: "@me",icon: "", owner_id: "", created_at: "", updated_at: ""};
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
						{ dm && state_context.editChannel !== true && <Chat channel_id={dm_channel.uuid} dm={true} />}
						{ dm === false && currentChannel.uuid !== "@me" && state_context.editChannel !== true &&
							<>
								<Chat channel_id={currentChannel.uuid} dm={false} />
								{ state_context.showMembers && <MembersBar channel={currentChannel} /> }
							</>
						}

						{ currentChannel.uuid === "@me" && dm_channel.uuid === "@me" && !state_context.editChannel && <ChannelHome /> }
						{ state_context.createChannel && <CreateChannel /> }
						{ state_context.editChannel && <EditChannel /> }
						{ state_context.deleteChannel && <DeleteChannel /> }
						{ state_context.deleteMessage && <DeleteMessage /> }
						{ state_context.showProfile && <Profile /> }
						{ call_ctx.incoming && <CallPopUp /> }
						{ ctx_menu_context.showMsgCtxMenu && <MessageContextMenu location={ctx_menu_context.ctxMsgMenuLocation} /> }
						{ ctx_menu_context.showChannelCtxMenu && <ChannelContextMenu location={ctx_menu_context.ctxChannelMenuLocation} /> }
						{ ctx_menu_context.showMemberCtxMenu && <MemberContextMenu location={ctx_menu_context.ctxMemberMenuLocation} /> }
						{ ctx_menu_context.showFriendCtxMenu && <FriendContextMenu value={ctx_menu_context.ctxFriendMenuLocation} /> }
					</>
					</MessageCTX>
			}
			{ state_context.Settings && <Settings /> }

		</div>
	);
}
export default Channel;