import React, { useContext, useState, useEffect } from 'react'
import { ChannelOBJ, UserOBJ } from '../models/models';
import { UserContextOBJ, UserContext } from "../contexts/usercontext";
import { ChannelsContext, ChannelContext } from "../contexts/channelctx";
import { StatesContext, StateContext } from "../contexts/states";
import { useNavigate } from "react-router-dom";
import { GetDMChannel } from '../api/channel';
import { RelationshipToDefault, RelationshipToFriend } from '../api/relationship'
interface propsMsgCtxProps {
    event: React.MouseEvent<HTMLDivElement, MouseEvent>, member: UserOBJ, channel: ChannelOBJ
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
        state_context.setChannelOBJ(channel);
        state_context.setIsBan(ban);
        state_context.setShowKickBan(true);
    }

    function Message() {
        GetDMChannel(user_ctx.accessToken, props.member.id).then(response => {
            if (response.status === 200) {
                response.json().then(dm_channel => {
                    if (!channel_context.channels.has(dm_channel.id)) {
                        console.log("channel not found");
                        let channel: ChannelOBJ = dm_channel;
                        channel_context.setChannel(prevChannels => new Map(prevChannels.set(channel.id, channel)));
                    }
                    navigate(`/channels/${dm_channel.id}`);
                })
            }
        })
    }

    const deleteFriend = () => {
        RelationshipToDefault(user_ctx.accessToken, props.member.id).then(relationship => {
            user_ctx.setRelationships(prevRelationships => new Map(prevRelationships.set(props.member.id, relationship)));
            setIsFriend(0);
        });
    }
    

    useEffect(() => {
        const is_friend = user_ctx.relationships.get(props.member.id)
        if (is_friend === undefined) {
            setIsFriend(0)
        } else {
            if (is_friend.type === 1) {
                setIsFriend(1)
            } else if (is_friend.type === 2) {
                setIsFriend(2)
            } else if (is_friend.type === 3) {
                setIsFriend(3)
            } else if (is_friend.type === 4) {
                setIsFriend(4)
            }
        }
    }, [props.member, user_ctx.relationships])

    return (
        <div className='ContextMenu' style={style}>
            { props.member.id !== user_ctx.id && <button className='CtxBtn' onClick={Message}>Message</button> }
            { props.member.id !== user_ctx.id && isFriend === 0 && <button className='CtxBtn' onClick={() => RelationshipToFriend(user_ctx.accessToken, props.member.id)}>Add Friend</button> }
            { props.member.id !== user_ctx.id && isFriend === 3 && <button className='CtxBtn' onClick={() => RelationshipToFriend(user_ctx.accessToken, props.member.id)}>Accept Request</button> }
            { props.member.id !== user_ctx.id && isFriend === 3 && <button className='CtxDelBtn' onClick={deleteFriend}>Decline Request</button> }
            { props.member.id !== user_ctx.id && isFriend === 4 && <button className='CtxDelBtn' onClick={deleteFriend}>Cancel Request</button> }
            { props.member.id !== user_ctx.id && isFriend === 1 && <button className='CtxDelBtn' onClick={deleteFriend}>Remove Friend</button> }
            { channel.owner_id === user_ctx.id && props.member.id !== user_ctx.id && <button className='CtxDelBtn' onClick={() =>{ handleKickOrBan(false) }}>Kick {props.member.username}</button> }
            { channel.owner_id === user_ctx.id && props.member.id !== user_ctx.id && <button className='CtxDelBtn' onClick={() =>{ handleKickOrBan(true) }}>Ban {props.member.username}</button> }
            <button className='CtxBtn' onClick={() => {navigator.clipboard.writeText(props.member.id)}}>Copy ID</button>
        </div>
    )
}