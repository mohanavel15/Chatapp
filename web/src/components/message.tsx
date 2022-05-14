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

    const [isBlocked, setIsBlocked] = useState(false);
    const [ShowMsg, setShowMsg] = useState(true);

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

    useEffect(() => {
        const author_id = message.author.uuid;
        const is_blocked = user_ctx.blocked.has(author_id);
        setIsBlocked(is_blocked);
    }, [user_ctx.blocked, message.author])

    useEffect(() => {
        if (isBlocked) {
            setShowMsg(false);
        } else {
            setShowMsg(true);
        }
    }, [isBlocked])

    useEffect(() => {
        if (message.author.uuid === "00000000-0000-0000-0000-000000000000" && message.author.username === "System") {
            setTimeout(() => {
                channel_context.DeleteMessage(message.channel_id, message.uuid);
            }, 15000);
        }
    }, [message])

    function onInputChange(event: React.ChangeEvent<HTMLInputElement>) {
		const inputstr = event.target.value;
		if (inputstr.length <= 2000) {
			setMsg(inputstr);
		} else {
			alert("Message too long");
		}
    }

    return (
    <div className="Message" ref={messageElement}>
        { !ShowMsg && <div className="BlockedUserDiv"><p className="message-edit-text BlockedUserMessage">Message From User You Blocked! <button className="Message-Edit-Action BlockedUserMessage" onClick={() => {setShowMsg(true)}}>Reveal</button></p></div> }
        { ShowMsg && 
            <>
            <img id="Message-avatar" src={message.author.avatar} alt="Avatar" onError={setDefaultAvatar} />
            <div id="Message-text"> 
                <div id="Message-author">
                    <span className="message-author-name"> {message.author.username}</span>
                    <span className="message-time"> {time}</span>
                </div>
                {edit !== true && <p className='Message-content'> {message.content} </p> }
                {edit && 
                <div>
                <input id="chat-text" type="text" value={msg} onKeyDown={handleKey} onChange={onInputChange} />
                <p className="message-edit-text">Escape to <button className="Message-Edit-Action" onClick={cancelEdit}>Cancel</button> • Enter to <button className="Message-Edit-Action" onClick={handleEdit}>Save</button></p>
                </div>
                }
                { isBlocked && <button className="Message-Edit-Action" onClick={() => {setShowMsg(false)}}>Hide</button> }
            </div>
            {user_ctx.uuid === message.author.uuid && <button id="Message-button" onClick={handleEditBtn}><FontAwesomeIcon icon={faPencil}/></button>}
            </>
        }
    </div>
);
}
  
export default Message;