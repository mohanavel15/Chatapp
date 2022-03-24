import React from 'react'

import { MemberOBJ } from '../models/models';

interface propsMsgCtxProps {
    location: {event: React.MouseEvent<HTMLDivElement, MouseEvent>, member: MemberOBJ},
}

export default function MemberContextMenu(props:propsMsgCtxProps) {
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
            <button className='CtxDelBtn'>Kick {props.location.member.username}</button>
            <button className='CtxDelBtn'>Ban {props.location.member.username}</button>
            <button className='CtxBtn' onClick={() => {navigator.clipboard.writeText(props.location.member.uuid)}}>Copy ID</button>
        </div>
    )
}