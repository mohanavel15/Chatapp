import Picker, { IEmojiData } from 'emoji-picker-react';
import React, { useState, useContext, useEffect } from 'react';
import Message from './message';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFaceLaughBeam } from '@fortawesome/free-solid-svg-icons'
import ChannelHeader from './channel_header';
import { ChannelOBJ, Msg_request, MessageOBJ } from '../models/models';
import { ChannelsContext, ChannelContext } from "../contexts/channelctx";
import { ContextMenuCtx, ContextMenu } from "../contexts/context_menu_ctx";

function Chat({ channel }: { channel: ChannelOBJ }) {
    // Emoji picker https://www.cluemediator.com/how-to-add-emoji-picker-in-the-react
	const channel_context: ChannelContext = useContext(ChannelsContext);
    const [Input_message, setInput_message] = useState('');
    const [showPicker, setShowPicker] = useState(false);
	const [message_jsx, setMessage_jsx] = useState<JSX.Element[]>([]);
   
	const ctx_menu_context: ContextMenuCtx = useContext(ContextMenu);

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
			setInput_message('');
		}
    }
	
	useEffect(() => {
		setMessage_jsx([])
		let msg_channel = channel_context.messages.get(channel.uuid);
		if (!msg_channel) {
			msg_channel = new Map<String, MessageOBJ>()
		}
		msg_channel.forEach((message, key) => {
				if (message.channel.uuid === channel.uuid) {
					setMessage_jsx(prevMessage =>  [...prevMessage, 
					<div key={message.uuid} onContextMenu={
						(event) => {
							event.preventDefault();
							ctx_menu_context.closeAll();
							ctx_menu_context.setMsgCtxMenuLocation({x: event.clientX, y: event.clientY, message: message, channel: channel});
							ctx_menu_context.setShowMsgCtxMenu(true);
						}
					}>
					<Message  
					message={message}
					/>
					</div>
					])
				}
			});
	}, [channel_context.messages, channel]);

    return (
        <div className="Chat">
			<ChannelHeader channel={channel} />
				<div className="chat-message">
					{message_jsx}
				</div>
			<div className="chat-input">
				<button id="chat-emoji-picker" onClick={() => setShowPicker(val => !val)}>
					<FontAwesomeIcon icon={faFaceLaughBeam} />
				</button>
				<input id="chat-text" type="text" placeholder="Type a message..." onKeyPress={updateChat} value={Input_message} onChange={onInputChange}/>
			</div>
			{showPicker && <div className="EmojiPicker"><Picker onEmojiClick={onEmojiClick} /></div>}
        </div>
    );
  }

export default Chat;
