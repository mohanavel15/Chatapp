import axios from 'axios';
import React, { useRef, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChannelsContext, ChannelContext } from '../contexts/channelctx';

function SideTopBar() {
    const navegate = useNavigate();
    const InviteCode = useRef<HTMLInputElement>(undefined!);

    const channel_context: ChannelContext = useContext(ChannelsContext);

    function JoinChannel(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        event.preventDefault()
        const inv_code = InviteCode.current.value
        axios.get(`http://127.0.0.1:5000/invites/${inv_code}`, {
            headers: {
				Authorization: localStorage.getItem("access_token") || ""
			}
        }).then(res => {
            if (res.status === 200) {
                channel_context.setChannels(channel_context.channels.set(res.data.uuid, res.data))
                navegate(`/channels/${res.data.uuid}`)
            }
        })
        InviteCode.current.value = ""
    }

    return (
        <div className='SideTopBar'>
            <input id="InviteCode" type="text" placeholder="Invite Code" ref={InviteCode} />
            <button id="STB_Button" onClick={JoinChannel}>Join Channel</button>
            <button id="STB_Button" onClick={(e) => {e.preventDefault(); navegate("/channels/profile") }}>Create Channel</button>
            <button id="STB_Button" onClick={(e) => {e.preventDefault(); navegate("/channels/friends") }}>Friends</button>
        </div>
  )
}
export default SideTopBar;