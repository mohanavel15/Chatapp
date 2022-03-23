import Picker, { IEmojiData } from 'emoji-picker-react';
import React, { useState, useContext, useEffect, useRef } from 'react';
import Message from './message';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclePlus, faFaceLaugh } from '@fortawesome/free-solid-svg-icons'
import ChannelHeader from './channel_header';
import { MessageOBJ, ChannelOBJ, Msg_request } from '../models/models';
import { ChannelsContext, ChannelContext } from "../contexts/channelctx";
import MessageContextMenu from '../contextmenu/message_context_menu';

function Chat({ channel }: { channel: ChannelOBJ }) {
    // Emoji picker https://www.cluemediator.com/how-to-add-emoji-picker-in-the-react
	const channel_context: ChannelContext = useContext(ChannelsContext);
	const bottom_ref = useRef<null | HTMLDivElement>(null);
    const [Input_message, setInput_message] = useState('');
    const [showPicker, setShowPicker] = useState(false);
	const [message_jsx, setMessage_jsx] = useState<JSX.Element[]>([]);

	const [showCtxMenu, setShowCtxMenu] = useState(false);
	const [ctxMenuLocation, setCtxMenuLocation] = useState<{x: number, y: number, message:MessageOBJ}>(undefined!);
   
    const onEmojiClick = (_: React.MouseEvent<Element, MouseEvent>, data: IEmojiData) => {
		setInput_message(prevInput => prevInput + data.emoji);
		setShowPicker(false);
    };
    

    function onInputChange(event: React.ChangeEvent<HTMLInputElement>) {
		const inputstr = event.target.value;
		if (inputstr.length <= 150) {
			setInput_message(inputstr);
		} else {
			alert("Message too long");
		}
    }
    function updateChat(event: React.KeyboardEvent<HTMLInputElement>) {
		if (event.key === 'Enter') {
			event.preventDefault();
			console.log(Input_message)
			if (channel.uuid !== "@me") {
				if (Input_message.length > 0) {
					const message: Msg_request = {
						channel: channel.uuid,
						content: Input_message
					};
					channel_context.gateway.send(
						JSON.stringify({
							event: "MESSAGE_CREATE",
							data: message
						})
					);
				}
			}
			setInput_message('');
		}
    }

	useEffect(() => {
		const handleClick = () => setShowCtxMenu(false);
		window.addEventListener('click', handleClick);
		return () => window.removeEventListener('click', handleClick);
	  }, []);
	
	useEffect(() => {
		setMessage_jsx([])
		channel_context.messages.forEach(message => 
			{
				if (message.channel.uuid === channel.uuid) {
					setMessage_jsx(prevMessage =>  [...prevMessage, 
					<div onContextMenu={
						(event) => {
							event.preventDefault();
							setCtxMenuLocation({x: event.clientX, y: event.clientY, message: message});
							setShowCtxMenu(true);
						}
					}>
					<Message key={message.uuid} 
					avatar={message.author.avatar} 
					name={message.author.username} 
					message={message.content} 
					/>
					</div>
					])
				}

				if (bottom_ref.current !== null) {
					bottom_ref.current.scrollIntoView({ behavior: 'smooth' });
				}
			});
	}, [channel_context.messagesLoaded, channel_context.messages, channel]);

    return (
        <div className="Chat">
			<ChannelHeader name={channel.name} icon={channel.icon} />
				<div className="chat-message">
					{message_jsx}
					{ showCtxMenu && <MessageContextMenu location={ctxMenuLocation} /> }
					<div ref={bottom_ref} />
				</div>
			<div className="chat-input">
				<button id="chat-file">
					<FontAwesomeIcon icon={faCirclePlus} />
				</button>
				<button id="chat-emoji-picker" onClick={() => setShowPicker(val => !val)}>
					<FontAwesomeIcon icon={faFaceLaugh} />
				</button>
				<input id="chat-text" type="text" placeholder="Type a message..." onKeyPress={updateChat} value={Input_message} onChange={onInputChange}/>
			</div>
			{showPicker && <Picker onEmojiClick={onEmojiClick} />}
        </div>
    );
  }

export default Chat;
