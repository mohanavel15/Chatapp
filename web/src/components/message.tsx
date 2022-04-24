import { useState, useEffect, useContext, useRef } from "react";
import { setDefaultAvatar } from '../utils/errorhandle';
import { MessageContext } from "../contexts/messagectx";
import { MessageOBJ } from "../models/models";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil } from '@fortawesome/free-solid-svg-icons'
import { ChannelsContext, ChannelContext } from '../contexts/channelctx';
import { UserContextOBJ, UserContext } from "../contexts/usercontext";

function Message({ message }: {message: MessageOBJ}) {
    const msgctx = useContext(MessageContext);
    const user_ctx:UserContextOBJ = useContext(UserContext);
    const channel_context: ChannelContext = useContext(ChannelsContext);
    const messageElement = useRef<HTMLDivElement>(null);

    const [edit, setEdit] = useState(false);
    const [msg, setMsg] = useState('');

    let time = new Date(message.created_at * 1000).toLocaleTimeString();

    useEffect(() => {
        setMsg(message.content);
    }, [message]);

    useEffect(() => {
        if (msgctx.messageEdit && msgctx.message.uuid === message.uuid) {
            setEdit(true);
        } else {
            setEdit(false);
        }
    }, [msgctx.messageEdit, msgctx.message]);

    useEffect(() => {
        if (messageElement.current !== null) {
            messageElement.current.scrollIntoView({
                behavior: "smooth",
                block: "end"
            });
        }
    }, [])

    function handleEditBtn() {
        if (msgctx.messageEdit) {
            msgctx.setMessageEdit(false);
        }
        msgctx.setMessage(message);
        msgctx.setMessageEdit(true);
    }

    function handleEdit() {
        channel_context.gateway.send(
            JSON.stringify({
                event: "MESSAGE_MODIFY",
                data: {
                    uuid: message.uuid,
                    content: msg
                }
            })
        );
        msgctx.setMessageEdit(false);
        setEdit(false);
    }

    function cancelEdit() {
        setMsg(message.content)
        setEdit(false)
        msgctx.setMessageEdit(false)
    }

    function handleKey(event: React.KeyboardEvent<HTMLInputElement>) {
		if (event.key === 'Enter') {
            handleEdit();
        }
        if (event.key === 'Escape') {
            cancelEdit();
        }
    }

    return (
    <div className="Message" ref={messageElement}>
        <img id="Message-avatar" src={message.author.avatar} alt="Avatar" onError={setDefaultAvatar} />
        <div id="Message-text"> 
            <div id="Message-author">
                <span className="message-author-name"> {message.author.username}</span>
                <span className="message-time"> {time}</span>
            </div>
            {edit !== true && <p> {message.content} </p> }
            {edit && 
            <div>
            <input id="chat-text" type="text" defaultValue={msg} onKeyDown={handleKey} onChange={(ev) => {setMsg(ev.target.value)}} />
            <p className="message-edit-text">Escape to <button className="Message-Edit-Action" onClick={cancelEdit}>Cancel</button> • Enter to <button className="Message-Edit-Action" onClick={handleEdit}>Save</button></p>
            </div>
            }
        </div>
        {user_ctx.uuid === message.author.uuid && <button id="Message-button" onClick={handleEditBtn}><FontAwesomeIcon icon={faPencil}/></button>}
    </div>
);
}
  
export default Message;