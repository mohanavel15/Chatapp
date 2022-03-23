import React from 'react'

import { MessageOBJ } from '../models/models';

interface propsMsgCtxProps {
    location: {x: number, y: number, message: MessageOBJ},
}

export default function MessageContextMenu(props:propsMsgCtxProps) {
    let style: React.CSSProperties
    style = {
        top: props.location.y,
        left: props.location.x
    }

    console.log("message:", props.location.message.content);

    return (
        <div className='MessageContextMenu' style={style}>
            <button className='MsgCtxBtn' onClick={() => {navigator.clipboard.writeText(props.location.message.content)}}>Copy Text</button>
            <button className='MsgCtxBtn'>Edit Message</button>
            <button className='MsgCtxDelBtn'>Delete Message</button>
            <button className='MsgCtxBtn' onClick={() => {navigator.clipboard.writeText(props.location.message.uuid)}}>Copy ID</button>
        </div>
    )
}
