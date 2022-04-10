import React, { useContext } from 'react'
import axios from 'axios';
import { MemberOBJ, ChannelOBJ } from '../models/models';
import { UserContextOBJ, UserContext } from "../contexts/usercontext";
import { ChannelsContext, ChannelContext } from "../contexts/channelctx";
import { StatesContext, StateContext } from "../contexts/states";

interface propsMsgCtxProps {
    location: {event: React.MouseEvent<HTMLDivElement, MouseEvent>, member: MemberOBJ, channel: ChannelOBJ},
}

export default function MemberContextMenu(props:propsMsgCtxProps) {
    const user_ctx:UserContextOBJ = useContext(UserContext);    
	const channel_context: ChannelContext = useContext(ChannelsContext);
    const state_context: StateContext = useContext(StatesContext);
    const channel = props.location.channel;

    let style: React.CSSProperties
    style = {
        top: props.location.event.clientY,
        left: props.location.event.clientX,
    }

    function handleKickOrBan(ban: boolean) {
        axios.delete(`http://127.0.0.1:5000/channels/${channel.uuid}/members/${props.location.member.uuid}`, {
            headers: {
                Authorization: user_ctx.accessToken
            },
            data: {
                "ban": ban,
                "reason": "no reason"
            }
        }).then(res => {
            if (res.status === 200) {
                channel_context.DeleteMember(props.location.member.channel_id, props.location.member.uuid);
            }
        })
    }

    return (
        <div className='ContextMenu' style={style}>
            <button className='CtxBtn' onClick={() => { state_context.setProfileOBJ(props.location.member);state_context.setShowProfile(true) }}>Profile</button>
            <button className='CtxBtn'>Metion</button>
            { channel.owner_id === user_ctx.uuid && props.location.member.uuid !== user_ctx.uuid && <button className='CtxDelBtn' onClick={() =>{ handleKickOrBan(false) }}>Kick {props.location.member.username}</button> }
            { channel.owner_id === user_ctx.uuid && props.location.member.uuid !== user_ctx.uuid && <button className='CtxDelBtn' onClick={() =>{ handleKickOrBan(true) }}>Ban {props.location.member.username}</button> }
            <button className='CtxBtn' onClick={() => {navigator.clipboard.writeText(props.location.member.uuid)}}>Copy ID</button>
        </div>
    )
}