import React, { useContext, useEffect, useState } from 'react'
import { MessageOBJ } from '../models/models';
import { UserContextOBJ, UserContext } from "../contexts/usercontext";
import { StatesContext, StateContext } from "../contexts/states";
import { MessageContext } from "../contexts/messagectx";
import { ChannelsContext, ChannelContext } from "../contexts/channelctx";
import Routes from '../config'
interface propsMsgCtxProps {
    x: number, y: number, message: MessageOBJ, channel_id: string
}

export default function MessageContextMenu(props:propsMsgCtxProps) {
    const message = props.message;
    const user_ctx:UserContextOBJ = useContext(UserContext);
    const state_context: StateContext = useContext(StatesContext);
    const channel_ctx:ChannelContext = useContext(ChannelsContext);
    const msgctx = useContext(MessageContext);
    const channel = channel_ctx.channels.get(props.channel_id);

    const [isPinned, setIsPinned] = useState(false);
    useEffect(() => {
        const pinnedMessage = channel_ctx.pinnedMessages.get(message.channel_id)?.get(message.id);
        if (pinnedMessage !== undefined) {
            setIsPinned(true);
        } else {
            setIsPinned(false);
        }
    }, [channel_ctx.pinnedMessages, message.id])

    let style: React.CSSProperties
    style = {
        top: props.y,
        left: props.x
    }

    function PinMsg() {
        const url = Routes.Channels + '/' + message.channel_id + '/pins/' + message.id;
        fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': user_ctx.accessToken
            }
        }).then(res => {
            if (res.status === 200) {
                channel_ctx.UpdatePinnedMessage(message.channel_id, message.id, message);
            }
        })
    }

    function UnpinMsg() {
        const url = Routes.Channels + '/' + message.channel_id + '/pins/' + message.id;
        fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': user_ctx.accessToken
            }
        }).then(res => {
            if (res.status === 200) {
                channel_ctx.DeletePinnedMessage(message.channel_id, message.id);
            }
        })
    }

    return (
        <div className='ContextMenu' style={style}>
            <button className='CtxBtn' onClick={() => {navigator.clipboard.writeText(props.message.content)}}>Copy Text</button>
            { !isPinned && <button className='CtxBtn' onClick={PinMsg}>Pin Message</button> }
            { isPinned && <button className='CtxBtn' onClick={UnpinMsg}>Unpin Message</button> }
            { user_ctx.id === message.author.id && <button className='CtxBtn' onClick={
                () => {
                    msgctx.setMessage(message);
                    msgctx.setMessageEdit(true);
                }
            }
            >Edit Message</button> }
            { (user_ctx.id === message.author.id || channel?.owner_id === user_ctx.id) && <button className='CtxDelBtn' onClick={ () => {
                    state_context.setDeleteMessage(true);
                    state_context.setMessageOBJ(message);
            }
            }>Delete Message</button> }
            <button className='CtxBtn' onClick={() => {navigator.clipboard.writeText(props.message.id)}}>Copy ID</button>
        </div>
    )
}
