import { useState, useEffect, useContext, useRef } from "react";
import { setDefaultAvatar } from '../utils/errorhandle';
import { MessageContext } from "../contexts/messagectx";
import { MessageOBJ } from "../models/models";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil } from '@fortawesome/free-solid-svg-icons'
import { ChannelsContext, ChannelContext } from '../contexts/channelctx';
import { UserContextOBJ, UserContext } from "../contexts/usercontext";
import Routes from "../config";
import AttachmentDefault from "./attachment/default";
import AttachmentImage from "./attachment/image";
import AttachmentVideo from "./attachment/video";
import AttachmentAudio from "./attachment/audio";

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
            const file = message.attachments[0]
            
            if (file.content_type.search(/image\/.+/) !== -1) {
                setAttachmentElement(<AttachmentImage message={message} />)
            } else if (file.content_type.search(/video\/.+/) !== -1) {
                setAttachmentElement(<AttachmentVideo message={message} />)
            } else if (file.content_type.search(/audio\/.+/) !== -1) {
                setAttachmentElement(<AttachmentAudio message={message} />) 
            } else {
                setAttachmentElement(<AttachmentDefault message={message} />)
            }
        }
    }, [message]);

    useEffect(() => {
        setMsg(message.content);
    }, [message]);

    useEffect(() => {
        if (msgctx.messageEdit && msgctx.message.id === message.id) {
            setEdit(true);
        } else {
            setEdit(false);
        }
    }, [msgctx.messageEdit, msgctx.message, message]);
    
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
        if (message.system_message) {
            setTimeout(() => {
                channel_context.DeleteMessage(message);
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
            { !message.system_message && <img id="Message-avatar" src={message.author.avatar} alt="Avatar" onError={setDefaultAvatar} /> }
            <div id="Message-text"> 
            { !message.system_message && 
                <div id="Message-author">
                    <span className="message-author-name"> {message.author.username}</span>
                    <span className="message-time"> {time}</span>
                </div>
            }
                {edit !== true && message.content.length > 0 &&<p className='Message-content'> {message.content} </p> }
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