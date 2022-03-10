import Picker, { IEmojiData } from 'emoji-picker-react';
import React, { useState } from 'react';
import Message from './message';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclePlus, faFaceLaugh } from '@fortawesome/free-solid-svg-icons'
import ChannelHeader from './channel_header';
import { MessageOBJ } from '../models/models';

interface ChatProps {
	channel_id: string;
	messages: MessageOBJ[];
}


function Chat(props: ChatProps) {
    // Emoji picker https://www.cluemediator.com/how-to-add-emoji-picker-in-the-react
    const messages = props.messages;
	const channel_id = props.channel_id;

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

	const new_msgs = messages.map(message => 
		<>{ message.channel.uuid === channel_id && <Message key={message.uuid} avatar={message.author.avatar} name={message.author.username} message={message.content} /> }</>
	);

	console.log(new_msgs);

    return (
        <div className="Chat">
			<ChannelHeader id={props.channel_id} />
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
