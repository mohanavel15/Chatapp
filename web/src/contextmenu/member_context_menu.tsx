import React, { useContext } from 'react'
import { MemberOBJ, ChannelOBJ } from '../models/models';
import { UserContextOBJ, UserContext } from "../contexts/usercontext";
import { ChannelsContext, ChannelContext } from "../contexts/channelctx";
import { StatesContext, StateContext } from "../contexts/states";
import { useNavigate } from "react-router-dom";
import Routes from '../config';

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
        const url = Routes.Channels + "/" + channel.uuid + "/members/" + props.location.member.uuid;
        fetch(url, {
            method: "DELETE",
            headers: {
                "Authorization": user_ctx.accessToken,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "ban": ban,
                "reason": "no reason"
            })
        }).then(res => {
            if (res.status === 200) {
                channel_context.DeleteMember(props.location.member.channel_id, props.location.member.uuid);
            }
        })
    }

    function Message() {
        const url = Routes.host + "/dms/" + props.location.member.uuid;
        fetch(url, {
            method: "GET",
            headers: {
                "Authorization": user_ctx.accessToken,
            }
        }).then(response => {
            if (response.status === 200) {
                response.json().then(dm_channel => {
                    if (!channel_context.channels.has(dm_channel.uuid)) {
                        let channel: ChannelOBJ = dm_channel;
                        channel.type = 0; 
                        channel_context.setChannels(prevChannels => new Map(prevChannels.set(channel.uuid, channel)));
                    }
                    navigate(`/channels/${dm_channel.uuid}`);
                })
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