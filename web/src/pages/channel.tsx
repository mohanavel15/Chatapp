import SideBar from "../components/sidebar";
import Chat from "../components/chat";
import { useParams } from "react-router-dom";
import React, { useState, useContext, useEffect } from "react";
import { StatesContext, StateContext } from "../contexts/states";
import { ChannelsContext, ChannelContext } from "../contexts/channelctx";
import Settings from "./settings"; 
import { MessageOBJ, ChannelOBJ } from "../models/models";
import { IMessageEvent } from "websocket";
import axios from "axios";


function Channel() {
	const parameter  = useParams<string>();
	let channel_id = parameter.id || "@me";

	const state_context: StateContext = useContext(StatesContext);
	const channel_context: ChannelContext = useContext(ChannelsContext);

	useEffect(() => {
		const onMessage = (message: IMessageEvent) => {
			console.log(message);
			const data = message.data;
			if (typeof data === "string") {
			const payload = JSON.parse(data);
				if (payload.event === 'READY') {

					localStorage.setItem('profile-uuid', payload.data.uuid);
					localStorage.setItem('profile-username', payload.data.username);
					localStorage.setItem('profile-avatar', payload.data.avatar);
				}

				if (payload.event === 'INVAILD_SESSION') {
					localStorage.removeItem('access_token');
					window.location.href = '/';
				}
			}
		};
	
		const onOpen = () => {
			console.log("Connecting to the server");
			channel_context.gateway.send(
				JSON.stringify({
					event: "CONNECT",
					data: { token: localStorage.getItem("access_token") }
				})
			);
		};
	
		const onClose = () => {
			console.log("Disconnected from server");
		};
	
		channel_context.gateway.onopen = onOpen;
		channel_context.gateway.onclose = onClose;
	  	channel_context.gateway.onmessage = onMessage;
  
		return () => {
			channel_context.gateway.close();
		};
	}, []);

	let currentChannel = channel_context.channels.get(channel_id);
	if (!currentChannel) {
		currentChannel = { uuid: "@me", name: "@me",icon: "" }
	}

	return (
		<div className="Channel">
			{ !state_context.Settings && <><SideBar /><Chat channel={currentChannel} /></> }
			{ state_context.Settings && <Settings /> }
		</div>
	);
}
export default Channel;