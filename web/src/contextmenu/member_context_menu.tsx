import React, { useContext } from 'react'
import axios from 'axios';
import { MemberOBJ, ChannelOBJ } from '../models/models';
import { UserContextOBJ, UserContext } from "../contexts/usercontext";
import { ChannelsContext, ChannelContext } from "../contexts/channelctx";
interface propsMsgCtxProps {
    location: {event: React.MouseEvent<HTMLDivElement, MouseEvent>, member: MemberOBJ, channel: ChannelOBJ},
}

export default function MemberContextMenu(props:propsMsgCtxProps) {
    const user_ctx:UserContextOBJ = useContext(UserContext);    
	const channel_context: ChannelContext = useContext(ChannelsContext);
    const channel = props.location.channel;

    let style: React.CSSProperties
    style = {
        top: props.location.event.clientY,
        left: props.location.event.clientX,
    }

    function handleKickOrBan(_: boolean) {
        axios.delete(`http://127.0.0.1:5000/channels/${channel.uuid}/members/${props.location.member.uuid}`, {
            headers: {
                Authorization: user_ctx.accessToken
            }
        }).then(res => {
            if (res.status === 200) {
                const delete_member = (members: Map<String, Map<String, MemberOBJ>>, member: MemberOBJ) => {
                    let channel = members.get(member.channel_id);
                    if (!channel) {
                        channel = new Map<String, MemberOBJ>();
                    }
                    channel.delete(member.uuid);
                    members.set(member.channel_id, new Map(channel));
                    return members;
                }
                channel_context.setMembers(prevMembers => new Map(delete_member(prevMembers, props.location.member)));
            }
        })
    }

    return (
        <div className='ContextMenu' style={style}>
            <button className='CtxBtn'>Profile</button>
            <button className='CtxBtn'>Metion</button>
            { channel.owner_id === user_ctx.uuid && props.location.member.uuid !== user_ctx.uuid && <button className='CtxDelBtn' onClick={() =>{ handleKickOrBan(false) }}>Kick {props.location.member.username}</button> }
            { channel.owner_id === user_ctx.uuid && props.location.member.uuid !== user_ctx.uuid && <button className='CtxDelBtn' onClick={() =>{ handleKickOrBan(true) }}>Ban {props.location.member.username}</button> }
            <button className='CtxBtn' onClick={() => {navigator.clipboard.writeText(props.location.member.uuid)}}>Copy ID</button>
        </div>
    )
}