import { useState, useEffect, useContext, useRef } from "react";
import { setDefaultAvatar } from '../utils/errorhandle';
import { MessageContext } from "../contexts/messagectx";
import { MessageOBJ } from "../models/models";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faFile, faDownload } from '@fortawesome/free-solid-svg-icons'
import { ChannelsContext, ChannelContext } from '../contexts/channelctx';
import { UserContextOBJ, UserContext } from "../contexts/usercontext";
import Routes from "../config";

function Message({ message }: {message: MessageOBJ}) {
    const msgctx = useContext(MessageContext);
    const user_ctx:UserContextOBJ = useContext(UserContext);
    const channel_context: ChannelContext = useContext(ChannelsContext);
    const messageElement = useRef<HTMLDivElement>(null);
    

    const [edit, setEdit] = useState(false);
    const [msg, setMsg] = useState('');

    const [isBlocked, setIsBlocked] = useState(false);
    const [ShowMsg, setShowMsg] = useState(true);
    
    const [attachmentElement, setAttachmentElement] = useState<JSX.Element>(<></>);

    let time = new Date(message.created_at * 1000).toLocaleTimeString();

    useEffect(() => {
        if (message.attachments.length > 0) { 
            setAttachmentElement(
                <div className="attachment">
                    <div className="attachment-icon">
                        <FontAwesomeIcon icon={faFile} />
                    </div>
                    <div className="attachment-name">
                        <p className="attachment-filename">
                            <a href={message.attachments[0].url} rel="noreferrer" target="_blank">
                            {message.attachments[0].filename}
                            </a>
                        </p>
                        <p className="attachment-size">{message.attachments[0].size} bytes</p>
                    </div>
                    <button className="attachment-download">
                    <a href={message.attachments[0].url} rel="noreferrer" target="_blank">
                        <FontAwesomeIcon icon={faDownload} />
                    </a>
                    </button>
                </div>
            )
        }
    }, [message.attachments]);

    useEffect(() => {
        setMsg(message.content);
    }, [message]);

    useEffect(() => {
        if (msgctx.messageEdit && msgctx.message.id === message.id) {
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
        const url = Routes.Channels+"/"+message.channel_id +"/messages/"+message.id;
        fetch(url, {
            method: "PATCH",
            headers: {
                "Authorization": user_ctx.accessToken,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ content: msg })
        })
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
        const author_id = message.author.id;
        const relationship = user_ctx.relationships.get(author_id);
        if (relationship) {
            if (relationship.type === 2) {
                setIsBlocked(true);
            }
        }
    }, [user_ctx.relationships, message.author])

    useEffect(() => {
        if (isBlocked) {
            setShowMsg(false);
        } else {
            setShowMsg(true);
        }
    }, [isBlocked])

    useEffect(() => {
        if (message.author.id === "00000000-0000-0000-0000-000000000000" && message.author.username === "System") {
            setTimeout(() => {
                channel_context.DeleteMessage(message.channel_id, message.id);
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
                { attachmentElement }
                { isBlocked && <button className="Message-Edit-Action" onClick={() => {setShowMsg(false)}}>Hide</button> }
            </div>
            {user_ctx.id === message.author.id && <button id="Message-button" onClick={handleEditBtn}><FontAwesomeIcon icon={faPencil}/></button>}
            </>
        }
    </div>
);
}
  
export default Message;