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
        <div className='ContextMenu' style={style}>
            <button className='CtxBtn' onClick={() => {navigator.clipboard.writeText(props.location.message.content)}}>Copy Text</button>
            <button className='CtxBtn'>Edit Message</button>
            <button className='CtxDelBtn'>Delete Message</button>
            <button className='CtxBtn' onClick={() => {navigator.clipboard.writeText(props.location.message.uuid)}}>Copy ID</button>
        </div>
    )
}
