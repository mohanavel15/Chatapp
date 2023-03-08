import { useState, useEffect, useContext, useRef } from "react";
import { setDefaultAvatar } from '../../utils/errorhandle';
import { MessageContext } from "../../contexts/messagectx";
import { MessageOBJ } from "../../models/models";
import { RiPencilFill } from "react-icons/ri";
import { UserContext } from "../../contexts/usercontext";
import Routes from "../../config";
import AttachmentDefault from "./attachment/default";
import AttachmentImage from "./attachment/image";
import AttachmentVideo from "./attachment/video";
import AttachmentAudio from "./attachment/audio";
import { FaServer } from "react-icons/fa";
import { ContextMenu } from "../../contexts/context_menu_ctx";
import MessageContextMenu from "../../contextmenu/message_context_menu";

function Message({ message, short }: { message: MessageOBJ, short: boolean }) {
    const msgctx = useContext(MessageContext);
    const user_ctx = useContext(UserContext);
    const messageElement = useRef<HTMLDivElement>(null);
    const ctx_menu = useContext(ContextMenu);

    const [edit, setEdit] = useState(false);
    const [msg, setMsg] = useState(message.content);

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
        const url = Routes.Channels + "/" + message.channel_id + "/messages/" + message.id;
        fetch(url, {
            method: "PATCH",
            headers: {
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
                setShowMsg(false)
            }
        }
    }, [user_ctx.relationships, message.author])

    function onInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        const inputstr = event.target.value;
        if (inputstr.length <= 2000) {
            setMsg(inputstr);
        } else {
            alert("Message too long");
        }
    }

    return (
        <div className="relative w-full flex my-1 hover:bg-zinc-900" onContextMenu={(event) => {
            event.preventDefault();
            ctx_menu.open(<MessageContextMenu x={event.clientX} y={event.clientY} message={message} />)
        }
        }>
            <div className="absolute left-0 w-24 flex items-center justify-center">
                {(!message.system_message && !short && ShowMsg) && <img className="h-12 w-12 rounded-xl bg-zinc-800" src={message.author.avatar} alt="Avatar" onError={setDefaultAvatar} />}
                { message.system_message && <FaServer size={24} />}
            </div>
            <div className="w-full ml-24 mr-32 flex flex-col">
                {ShowMsg && <>
                    {(!message.system_message && !short) && <span className="text-xl">{message.author.username}</span>}
                    {!edit && <span className="text-neutral-400">{message.content}</span>}
                    {edit &&
                        <div>
                            <input className="bg-zinc-800 w-11/12 outline-none px-2 rounded" type="text" value={msg} onKeyDown={handleKey} onChange={onInputChange} />
                            <p className="text-xm">Escape to <button className="text-cyan-400 text-sm hover:underline" onClick={cancelEdit}>Cancel</button> • Enter to <button className="text-cyan-400 text-sm hover:underline" onClick={handleEdit}>Save</button></p>
                        </div>
                    }
                    {attachmentElement}
                    {isBlocked && <p className="text-cyan-500 text-xs cursor-pointer" onClick={() => { setShowMsg(false) }}>Hide</p>}
                </>}
                {!ShowMsg && <p>Message From User You Blocked! <button className="text-cyan-500" onClick={() => { setShowMsg(true) }}>Reveal</button></p>}
            </div>
            <div className="absolute right-0 w-32 flex justify-around">
                <span className="text-xs text-neutral-400">{time}</span>
                {user_ctx.id === message.author.id && <button onClick={handleEditBtn}><RiPencilFill /></button>}
            </div>
        </div>
    )
}

export default Message;