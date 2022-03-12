import Picker, { IEmojiData } from 'emoji-picker-react';
import React, { useState, useContext } from 'react';
import Message from './message';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclePlus, faFaceLaugh } from '@fortawesome/free-solid-svg-icons'
import ChannelHeader from './channel_header';
import { MessageOBJ, ChannelOBJ } from '../models/models';
import { ChannelsContext, ChannelContext } from "../contexts/channelctx";

function Chat({ channel }: { channel: ChannelOBJ }) {
    // Emoji picker https://www.cluemediator.com/how-to-add-emoji-picker-in-the-react
    //const messages = props.messages;
	//const channel = props.channel;

	const channel_context: ChannelContext = useContext(ChannelsContext);

    const [Input_message, setInput_message] = useState('');
    const [showPicker, setShowPicker] = useState(false);
   
    const onEmojiClick = (_: React.MouseEvent<Element, MouseEvent>, data: IEmojiData) => {
		setInput_message(prevInput => prevInput + data.emoji);
		setShowPicker(false);
    };
    

    function onInputChange(event: React.ChangeEvent<HTMLInputElement>) {
		const inputstr = event.target.value;
		if (inputstr.length <= 150) {
			setInput_message(inputstr);
		}
    }
    function updateChat(event: React.KeyboardEvent<HTMLInputElement>) {
		if (event.key === 'Enter') {
			event.preventDefault();
		}
    }

	const new_msgs = channel_context.messages.map(message => 
		<>{ message.channel.uuid === channel.uuid && <Message key={message.uuid} avatar={message.author.avatar} name={message.author.username} message={message.content} /> }</>
	);

    return (
        <div className="Chat">
			<ChannelHeader name={channel.name} icon={channel.icon} />
				<div className="chat-message">
					{new_msgs}
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
