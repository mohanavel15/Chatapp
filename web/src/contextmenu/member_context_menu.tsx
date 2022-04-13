import React, { useContext } from 'react'
import axios from 'axios';
import { MemberOBJ, ChannelOBJ, DMChannelOBJ } from '../models/models';
import { UserContextOBJ, UserContext } from "../contexts/usercontext";
import { ChannelsContext, ChannelContext } from "../contexts/channelctx";
import { StatesContext, StateContext } from "../contexts/states";
import { useNavigate } from "react-router-dom";

interface propsMsgCtxProps {
    location: {event: React.MouseEvent<HTMLDivElement, MouseEvent>, member: MemberOBJ, channel: ChannelOBJ},
}

export default function MemberContextMenu(props:propsMsgCtxProps) {
    const user_ctx:UserContextOBJ = useContext(UserContext);    
	const channel_context: ChannelContext = useContext(ChannelsContext);
    const state_context: StateContext = useContext(StatesContext);
    const channel = props.location.channel;
    const navigate = useNavigate();

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

    function Message() {
        axios.get<DMChannelOBJ>(`http://127.0.0.1:5000/dms/${props.location.member.uuid}`, {
            headers: {
                Authorization: localStorage.getItem("access_token") || ""
            }
        }).then(response => {
            if (response.status === 200) {
                const dm_channel_id = response.data.uuid;
                if (!channel_context.DMChannels.has(dm_channel_id)) {
                    channel_context.setDMChannels(prevChannels => new Map(prevChannels.set(dm_channel_id, response.data)));
                }
                navigate(`/channels/${dm_channel_id}`);
            }
        })
    }

    return (
        <div className='ContextMenu' style={style}>
            <button className='CtxBtn' onClick={() => { state_context.setProfileOBJ(props.location.member);state_context.setShowProfile(true) }}>Profile</button>
            <button className='CtxBtn' onClick={Message}>Message</button>
            { channel.owner_id === user_ctx.uuid && props.location.member.uuid !== user_ctx.uuid && <button className='CtxDelBtn' onClick={() =>{ handleKickOrBan(false) }}>Kick {props.location.member.username}</button> }
            { channel.owner_id === user_ctx.uuid && props.location.member.uuid !== user_ctx.uuid && <button className='CtxDelBtn' onClick={() =>{ handleKickOrBan(true) }}>Ban {props.location.member.username}</button> }
            <button className='CtxBtn' onClick={() => {navigator.clipboard.writeText(props.location.member.uuid)}}>Copy ID</button>
        </div>
    )
}