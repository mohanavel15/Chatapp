import Picker, { IEmojiData } from 'emoji-picker-react';
import React, { useState, useContext, useEffect, useRef } from 'react';
import Message from './message';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFaceLaughBeam, faCirclePlus, faFile, faCircleXmark } from '@fortawesome/free-solid-svg-icons'
import ChannelHeader from './channel_header';
import { MessageOBJ } from '../models/models';
import { ChannelsContext, ChannelContext } from "../contexts/channelctx";
import { ContextMenuCtx, ContextMenu } from "../contexts/context_menu_ctx";
import { UserContextOBJ, UserContext } from "../contexts/usercontext";

import Routes from '../config';

function Chat({ channel_id }: { channel_id: string }) {
    // Emoji picker https://www.cluemediator.com/how-to-add-emoji-picker-in-the-react
	const channel_context: ChannelContext = useContext(ChannelsContext);
    const [Input_message, setInput_message] = useState('');
    const [showPicker, setShowPicker] = useState(false);
	const [message_jsx, setMessage_jsx] = useState<JSX.Element[]>([]);

    const [hasFile, setHasFile] = useState(false);
	const file_input = useRef<HTMLInputElement>(undefined!);
	const [fileJSX, setFileJSX] = useState<JSX.Element>(<></>);

	const ctx_menu_context: ContextMenuCtx = useContext(ContextMenu);
	const user_ctx:UserContextOBJ = useContext(UserContext);

    const onEmojiClick = (_: React.MouseEvent<Element, MouseEvent>, data: IEmojiData) => {
		setInput_message(prevInput => prevInput + data.emoji);
		setShowPicker(false);
    };

	
    function onInputChange(event: React.ChangeEvent<HTMLInputElement>) {
		const inputstr = event.target.value;
		if (inputstr.length <= 2000) {
			setInput_message(inputstr);
		} else {
			alert("Message too long");
		}
    }
    function updateChat(event: React.KeyboardEvent<HTMLInputElement>) {
		if (event.key === 'Enter') {
			event.preventDefault();
			console.log(file_input.current.files);
			if (Input_message.length > 0 && file_input === null || file_input.current.files?.length === 0) {
				const url = Routes.Channels+"/"+channel_id +"/messages"; 
				fetch(url, {
					method: "POST",
					headers: {
						"Authorization": user_ctx.accessToken,
						"Content-Type": "application/json"
					},
					body: JSON.stringify({ content: Input_message })
				})
			}

			if (file_input.current.files && file_input.current.files.length > 0) {
				const url = Routes.Channels+"/"+channel_id +"/messages";
				const formData = new FormData();
				formData.append('content', Input_message);
				formData.append('file', file_input.current.files[0]);
				fetch(url, {
					method: "POST",
					headers: {
						"Authorization": user_ctx.accessToken,
					},
					body: formData
				})
			}
			setInput_message('');
			setHasFile(false);
			file_input.current.value = '';
		}
    }
	
	useEffect(() => {
		setMessage_jsx([])
		let msg_channel = channel_context.messages.get(channel_id);

		if (!msg_channel) {
			msg_channel = new Map<String, MessageOBJ>()
		}

		const msgs = Array.from(msg_channel.values()).sort((a, b) => { return a.created_at - b.created_at;});

		let preDate: string
		msgs.forEach((message) => {
				if (message.channel_id === channel_id) {
					let date = new Date(message.created_at * 1000).toLocaleDateString();
					if (preDate === undefined || preDate !== date) {
						setMessage_jsx(prevMessage =>  [...prevMessage, <div key={date} className="date-divider">{date}</div>])
						preDate = date;
					}

					setMessage_jsx(prevMessage =>  [...prevMessage, 
					<div key={message.id} onContextMenu={(event) => {
							event.preventDefault();
							ctx_menu_context.closeAll();
							ctx_menu_context.setMsgCtxMenu({x: event.clientX, y: event.clientY, message: message, channel_id: channel_id});
							ctx_menu_context.setShowMsgCtxMenu(true);
						}
					}>
					<Message message={message} />
					</div>
					])
				}
			});
	}, [channel_context.messages, channel_id]);

	const onFileChange = () => {
		if (file_input.current.files && file_input.current.files.length > 0) {
			setHasFile(true);
			const file = file_input.current.files[0];
				setFileJSX(
					<div className='input-file' key={file.name}>
						<FontAwesomeIcon icon={faFile} />
						<button className='input-file-delete' onClick={() => {file_input.current.value='';onFileChange();}}>
							<FontAwesomeIcon icon={faCircleXmark} />
						</button>
						<p>{file.name}</p>
					</div>
				)
		} else {
			setHasFile(false);
		}
	}

    return (
        <div className="Chat">
				<div className="chat-message">
					{message_jsx}
				</div>
			<div className="chat-input">
				{ hasFile && 
				<div className='input-file-container'>
					{fileJSX}
				</div>
				}
				<button id="chat-file" onClick={() => { file_input.current.click() }}>
					<FontAwesomeIcon icon={faCirclePlus} />
				</button>
				<input type="file" ref={file_input} name="filename" hidden onChange={onFileChange}></input>
				<button id="chat-emoji-picker" onClick={() => setShowPicker(val => !val)}>
					<FontAwesomeIcon icon={faFaceLaughBeam} />
				</button>
				<input id="chat-text" type="text" placeholder="Type a message..." onKeyPress={updateChat} value={Input_message} onChange={onInputChange}/>
			</div>
			{showPicker && <div className="EmojiPicker"><Picker onEmojiClick={onEmojiClick} /></div>}
			<ChannelHeader channel_id={channel_id} />
		</div>
    );
  }

export default Chat;
