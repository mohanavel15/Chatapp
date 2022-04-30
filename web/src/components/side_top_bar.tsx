import React, { useRef, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChannelsContext, ChannelContext } from '../contexts/channelctx';
import { StatesContext, StateContext } from "../contexts/states";
import { UserContextOBJ, UserContext } from "../contexts/usercontext";
import Routes from '../config';

function SideTopBar() {
    const navegate = useNavigate();
    const InviteCode = useRef<HTMLInputElement>(undefined!);

    const user_ctx:UserContextOBJ = useContext(UserContext);
    const state_context: StateContext = useContext(StatesContext);
    const channel_context: ChannelContext = useContext(ChannelsContext);

    function JoinChannel(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        event.preventDefault()
        const inv_code = InviteCode.current.value;
        const url = Routes.Invites+`/${inv_code}`
        fetch(url, {
            method: "GET",
            headers: {
                "Authorization": user_ctx.accessToken,
                }
            }).then(response => {
                if (response.status === 200) {
                    response.json().then(channel => {
                        channel.type = 1;
                        channel_context.setChannels(prevChannels => new Map(prevChannels.set(channel.uuid, channel)));
                        navegate(`/channels/${channel.uuid}`)
                    })
                }
            })
        InviteCode.current.value = ""
    }

    return (
        <div className='SideTopBar'>
            <input id="InviteCode" type="text" placeholder="Invite Code" ref={InviteCode} />
            <button id="STB_Button" onClick={JoinChannel}>Join Channel</button>
            <button id="STB_Button" onClick={(e) => {e.preventDefault(); state_context.setCreateChannel(true) }}>Create Channel</button>
            <button id="STB_Button" onClick={(e) => {e.preventDefault(); navegate("/channels/@me") }}>Friends</button>
        </div>
  )
}
export default SideTopBar;