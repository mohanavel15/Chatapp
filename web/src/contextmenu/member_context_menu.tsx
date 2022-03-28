import React, { useContext } from 'react'

import { MemberOBJ, ChannelOBJ } from '../models/models';
import { UserContextOBJ, UserContext } from "../contexts/usercontext";
import { channel } from 'diagnostics_channel';

interface propsMsgCtxProps {
    location: {event: React.MouseEvent<HTMLDivElement, MouseEvent>, member: MemberOBJ, channel: ChannelOBJ},
}

export default function MemberContextMenu(props:propsMsgCtxProps) {
    const user_ctx:UserContextOBJ = useContext(UserContext);    
    const channel = props.location.channel;

    let style: React.CSSProperties
    style = {
        top: props.location.event.clientY,
        left: props.location.event.clientX,
    }

    console.log("member:", props.location.member.username);

    return (
        <div className='ContextMenu' style={style}>
            <button className='CtxBtn'>Profile</button>
            <button className='CtxBtn'>Metion</button>
            { channel.owner_id == user_ctx.uuid && props.location.member.uuid !== user_ctx.uuid && <button className='CtxDelBtn'>Kick {props.location.member.username}</button> }
            { channel.owner_id == user_ctx.uuid && props.location.member.uuid !== user_ctx.uuid && <button className='CtxDelBtn'>Ban {props.location.member.username}</button> }
            <button className='CtxBtn' onClick={() => {navigator.clipboard.writeText(props.location.member.uuid)}}>Copy ID</button>
        </div>
    )
}