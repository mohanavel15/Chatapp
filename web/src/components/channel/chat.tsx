import Picker, { IEmojiData } from 'emoji-picker-react';
import React, { useState, useContext, useRef, useMemo } from 'react';
import Message from './message';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFaceLaughBeam, faCirclePlus, faFile, faCircleXmark } from '@fortawesome/free-solid-svg-icons'
import Header from './header';
import { MessageOBJ, ChannelOBJ } from '../../models/models';
import { ChannelsContext, ChannelContext } from "../../contexts/channelctx";
import { ContextMenu } from "../../contexts/context_menu_ctx";
import { UserContextOBJ, UserContext } from "../../contexts/usercontext";
import { BsPlusCircleFill } from 'react-icons/bs';

import Routes from '../../config';
import { useParams } from 'react-router-dom';
import Recipients from './Recipients';

function Chat() {
	const parameter = useParams<string>();
	let channel_id = parameter.id || "";

	// Emoji picker https://www.cluemediator.com/how-to-add-emoji-picker-in-the-react
	const channel_context: ChannelContext = useContext(ChannelsContext);
	const [Input_message, setInput_message] = useState('');
	const [showPicker, setShowPicker] = useState(false);
	const [showRecipients, setShowRecipients] = useState(true);


	const channel: ChannelOBJ = channel_context.channels.get(channel_id) || {} as ChannelOBJ;

	const MessageElement = useMemo(() => {
		let messagesList: JSX.Element[] = [];

		let messages = channel_context.messages.get(channel_id);

		if (!messages) {
			messages = [] as MessageOBJ[]
		}

		let preDate: string
		messages.forEach((message) => {
			let date = new Date(message.created_at * 1000).toLocaleDateString();
			if (preDate === undefined || preDate !== date) {
				messagesList.push(<div key={date} className="date-divider">{date}</div>);
				preDate = date;
			}
			messagesList.push(
				<div key={message.id} onContextMenu={(event) => {
					event.preventDefault();
					ctx_menu.closeAll();
					ctx_menu.setMsgCtxMenu({ x: event.clientX, y: event.clientY, message: message });
					ctx_menu.setShowMsgCtxMenu(true);
				}
				}>
					<Message message={message} />
				</div>
			)
		});

		return messagesList;
	}, [channel_context.messages, channel_id]);

	const [hasFile, setHasFile] = useState(false);
	const file_input = useRef<HTMLInputElement>(undefined!);
	const [fileJSX, setFileJSX] = useState<JSX.Element>(<></>);

	const ctx_menu = useContext(ContextMenu);
	const user_ctx: UserContextOBJ = useContext(UserContext);

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
			if (Input_message.length > 0 && (file_input === null || file_input.current.files?.length === 0)) {
				const url = Routes.Channels + "/" + channel_id + "/messages";
				fetch(url, {
					method: "POST",
					headers: {
						"Content-Type": "application/json"
					},
					body: JSON.stringify({ content: Input_message })
				})
			}

			if (file_input.current.files && file_input.current.files.length > 0) {
				const url = Routes.Channels + "/" + channel_id + "/messages";
				const formData = new FormData();
				formData.append('content', Input_message);
				formData.append('file', file_input.current.files[0]);
				fetch(url, {
					method: "POST",
					body: formData
				})
			}
			setInput_message('');
			setHasFile(false);
			file_input.current.value = '';
		}
	}

	const onFileChange = () => {
		if (file_input.current.files && file_input.current.files.length > 0) {
			const file = file_input.current.files[0];
			if (file.size > 8388608) {
				alert("File is bigger than 8MB")
				file_input.current.value = ''
				return
			}
			setHasFile(true);
			setFileJSX(
				<div className='input-file' key={file.name}>
					<FontAwesomeIcon icon={faFile} />
					<button className='input-file-delete' onClick={() => { file_input.current.value = ''; onFileChange(); }}>
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
		<div className="relative h-full w-full flex-col flex">
			<Header channel={channel} toggleRecipients={setShowRecipients} />
			<div className='flex mt-16 h-full overflow-hidden w-full'>
				<div className='flex-col flex relative w-full'>
					<div className="mb-16 overflow-x-hidden overflow-y-scroll">
						{MessageElement}
					</div>
					<div className="h-16 absolute bottom-0 w-full flex items-center justify-evenly border-t border-zinc-800">
						{/* { hasFile && 
							<div className='input-file-container'>
							{fileJSX}
							</div> } 
						*/}
						{/* <button aria-label='upload file' id="chat-file" onClick={() => { file_input.current.click() }}>
							<FontAwesomeIcon icon={faCirclePlus} />
							</button>
							<button aria-label='emoji picker' id="chat-emoji-picker" onClick={() => setShowPicker(val => !val)}>
							<FontAwesomeIcon icon={faFaceLaughBeam} />
							</button> 
						*/}
						<input type="file" ref={file_input} name="filename" hidden onChange={onFileChange} />
						<BsPlusCircleFill size={26} onClick={() => file_input.current.click()} />
						<input className='w-[85%] h-8 rounded-md bg-zinc-800 px-4' type="text" placeholder="Type a message..." onKeyPress={updateChat} value={Input_message} onChange={onInputChange} />
					</div>
					{/* {showPicker && <div className="EmojiPicker"><Picker onEmojiClick={onEmojiClick} /></div>} */}
				</div>
				{ channel.type === 2 && showRecipients && <Recipients channel={channel} /> }
			</div>
		</div>
	);
}

export default Chat;
