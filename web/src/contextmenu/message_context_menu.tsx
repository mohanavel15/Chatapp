import React, { useContext } from 'react'

import { MessageOBJ, ChannelOBJ } from '../models/models';
import { UserContextOBJ, UserContext } from "../contexts/usercontext";

interface propsMsgCtxProps {
    location: {x: number, y: number, message: MessageOBJ, channel: ChannelOBJ},
}

export default function MessageContextMenu(props:propsMsgCtxProps) {
    const user_ctx:UserContextOBJ = useContext(UserContext);
    const message = props.location.message;
    const channel = props.location.channel;

    let style: React.CSSProperties
    style = {
        top: props.location.y,
        left: props.location.x
    }

    console.log("message:", props.location.message.content);

    return (
        <div className='ContextMenu' style={style}>
            <button className='CtxBtn' onClick={() => {navigator.clipboard.writeText(props.location.message.content)}}>Copy Text</button>
            { user_ctx.uuid === message.author.uuid && <button className='CtxBtn'>Edit Message</button> }
            { (user_ctx.uuid === message.author.uuid || channel.owner_id === user_ctx.uuid) && <button className='CtxDelBtn'>Delete Message</button> }
            <button className='CtxBtn' onClick={() => {navigator.clipboard.writeText(props.location.message.uuid)}}>Copy ID</button>
        </div>
    )
}
