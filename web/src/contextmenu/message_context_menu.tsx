import React, { useContext, useEffect, useState } from 'react'
import { MessageOBJ } from '../models/models';
import { UserContext } from "../contexts/usercontext";
import { MessageContext } from "../contexts/messagectx";
import { ChannelsContext } from "../contexts/channelctx";
import Routes from '../config'
import DeleteMessage from '../components/popup/DeleteMessage';
import { PopUpContext } from '../contexts/popup';
interface propsMsgCtxProps {
    x: number, y: number, message: MessageOBJ
}

export default function MessageContextMenu(props: propsMsgCtxProps) {
    const message = props.message;
    const user_ctx = useContext(UserContext);
    const popup_ctx = useContext(PopUpContext);
    const channel_ctx = useContext(ChannelsContext);
    const msgctx = useContext(MessageContext);
    const channel = channel_ctx.channels.get(props.message.channel_id);

    const [isPinned, setIsPinned] = useState(false);
    useEffect(() => {
        const pinnedMessage = channel_ctx.pinnedMessages.get(message.channel_id);
        if (pinnedMessage !== undefined) {
            for (let i = 0; i < pinnedMessage.length; i++) {
                const messageFound = pinnedMessage[i].id === message.id
                setIsPinned(messageFound ? true : false)
                if (messageFound) break
            }
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
            method: 'PUT'
        }).then(res => {
            if (res.status === 200) {
                channel_ctx.UpdatePinnedMessage(message);
            }
        })
    }

    function UnpinMsg() {
        const url = Routes.Channels + '/' + message.channel_id + '/pins/' + message.id;
        fetch(url, {
            method: 'DELETE'
        }).then(res => {
            if (res.status === 200) {
                channel_ctx.DeletePinnedMessage(message);
            }
        })
    }

    return (
        <div className='ContextMenu' style={style}>
            <button className='CtxBtn' onClick={() => { navigator.clipboard.writeText(props.message.content) }}>Copy Text</button>
            { !isPinned && <button className='CtxBtn' onClick={PinMsg}>Pin Message</button> }
            { isPinned && <button className='CtxBtn' onClick={UnpinMsg}>Unpin Message</button> }
            { user_ctx.id === message.author.id && <button className='CtxBtn' onClick={() => { msgctx.setMessage(message); msgctx.setMessageEdit(true) }}>Edit Message</button> }
            { (user_ctx.id === message.author.id || channel?.owner_id === user_ctx.id) && <button className='CtxDelBtn' onClick={() => popup_ctx.open(<DeleteMessage message={message} />)}>Delete Message</button> }
            <button className='CtxBtn' onClick={() => navigator.clipboard.writeText(props.message.id)}>Copy ID</button>
        </div>
    )
}
