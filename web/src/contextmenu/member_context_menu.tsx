import React, { useContext, useState, useEffect } from 'react'
import { MemberOBJ, ChannelOBJ } from '../models/models';
import { UserContextOBJ, UserContext } from "../contexts/usercontext";
import { ChannelsContext, ChannelContext } from "../contexts/channelctx";
import { StatesContext, StateContext } from "../contexts/states";
import { useNavigate } from "react-router-dom";
import { DMUser } from '../utils/api';
import { AddFriend, DeleteFriend } from '../api/friend';
interface propsMsgCtxProps {
    event: React.MouseEvent<HTMLDivElement, MouseEvent>, member: MemberOBJ, channel: ChannelOBJ
}

export default function MemberContextMenu(props:propsMsgCtxProps) {
    const user_ctx:UserContextOBJ = useContext(UserContext);    
	const channel_context: ChannelContext = useContext(ChannelsContext);
    const state_context: StateContext = useContext(StatesContext);
    const channel = props.channel;
    const navigate = useNavigate();
    const [isFriend, setIsFriend] = useState(0);

    let style: React.CSSProperties
    style = {
        top: props.event.clientY,
        left: props.event.clientX,
    }

    function handleKickOrBan(ban: boolean) {
        state_context.setKickBanMember(props.member);
        state_context.setIsBan(ban);
        state_context.setShowKickBan(true);
    }

    function Message() {
        DMUser(user_ctx.accessToken, props.member.uuid).then(response => {
            if (response.status === 200) {
                response.json().then(dm_channel => {
                    if (!channel_context.channels.has(dm_channel.uuid)) {
                        let channel: ChannelOBJ = dm_channel;
                        channel.type = 0; 
                        channel_context.setChannel(prevChannels => new Map(prevChannels.set(channel.uuid, channel)));
                    }
                    navigate(`/channels/${dm_channel.uuid}`);
                })
            }
        })
    }

    const deleteFriend = () => {
        DeleteFriend(user_ctx.accessToken, props.member.uuid).then(response => {
            if (response.status === 200) {
                user_ctx.deleteFriend(props.member.uuid)
            }
        })
    }
    

    useEffect(() => {
        const is_friend = user_ctx.friends.get(props.member.uuid)
        if (is_friend === undefined) {
            setIsFriend(0)
        } else {
            if (is_friend.pending === true) {
                setIsFriend(1)
            } else {
                setIsFriend(2)
            }
        }
    }, [props.member, user_ctx.friends])

    return (
        <div className='ContextMenu' style={style}>
            { props.member.uuid !== user_ctx.uuid && <button className='CtxBtn' onClick={Message}>Message</button> }
            { props.member.uuid !== user_ctx.uuid && isFriend === 0 && <button className='CtxBtn' onClick={() => AddFriend(user_ctx.accessToken, props.member.uuid)}>Add Friend</button> }
            { props.member.uuid !== user_ctx.uuid && isFriend === 1 && <button className='CtxDelBtn' onClick={deleteFriend}>Cancel Request</button> }
            { props.member.uuid !== user_ctx.uuid && isFriend === 2 && <button className='CtxDelBtn' onClick={deleteFriend}>Remove Friend</button> }
            { channel.owner_id === user_ctx.uuid && props.member.uuid !== user_ctx.uuid && <button className='CtxDelBtn' onClick={() =>{ handleKickOrBan(false) }}>Kick {props.member.username}</button> }
            { channel.owner_id === user_ctx.uuid && props.member.uuid !== user_ctx.uuid && <button className='CtxDelBtn' onClick={() =>{ handleKickOrBan(true) }}>Ban {props.member.username}</button> }
            <button className='CtxBtn' onClick={() => {navigator.clipboard.writeText(props.member.uuid)}}>Copy ID</button>
        </div>
    )
}