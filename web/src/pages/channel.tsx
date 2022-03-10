import SideBar from "../components/sidebar";
import Chat from "../components/chat";
import { useParams } from "react-router-dom";
import React, { useState, useEffect, useContext } from "react";
import { w3cwebsocket as W3CWebSocket, IMessageEvent } from "websocket";
import ChannelHome from "../components/channel_home";
import { ChannelContext, StateContext } from "../contexts/states";
import Settings from "./settings"; 
import { MessageOBJ } from "../models/models";
import { channel } from "diagnostics_channel";

const gateway = new W3CWebSocket('ws://127.0.0.1:5000/ws');

function Channel() {
	const parameter  = useParams<string>();
	const channel_id = parameter.channel_id || "";

	const [messages, setMessages] = useState<MessageOBJ[]>([
		{
			uuid:    "12345",
			content: "Hello, World!",
			author: {
				uuid:     "12345",
				avatar:   "",
				username: "Test User",
			},
			channel: {
				uuid: "12345",
				name: "Test Channel",
				icon: "",
			},
		},	
	]);



	const [channels, setChannels] = useState<Map<string, string>>(undefined!);

	const currentChannel = channels.get(channel_id) || "";

	const state_context: StateContext = useContext(ChannelContext);
  
	useEffect(() => {
		const onMessage = (message: IMessageEvent) => {
			console.log(message)
			/*const payload = JSON.parse(message.data);
			console.log(payload)
			if (payload.event === 'READY') {
				localStorage.setItem('profile-uuid', payload.data.uuid);
				localStorage.setItem('profile-username', payload.data.username);
				localStorage.setItem('profile-avatar', payload.data.avatar);
			}*/
		};
	
		const onOpen = () => {
			console.log("Connected to server");
			gateway.send(
			JSON.stringify({
				event: "CONNECT",
				data: {
				token: localStorage.getItem("access_token"),
				}
			})
			);
		};
	
		const onClose = () => {
			console.log("Disconnected from server");
		};
	
		gateway.onopen = onOpen;
		gateway.onclose = onClose;
	  	gateway.onmessage = onMessage;
  
		return () => {
			gateway.close();
		};
	}, []);
  
	return (
		<div className="Channel">
		  	{ !state_context.Settings && <><SideBar /><Chat messages={messages} channel_id={currentChannel} /></> }
		  	{ state_context.Settings && <Settings /> }
		</div>
	);
}
export default Channel;