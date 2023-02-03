import React, { useRef, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChannelsContext, ChannelContext } from '../contexts/channelctx';
import Routes from '../config';
import { PopUpContext } from '../contexts/popup';
import CreateChannel from './popup/CreateChannel';

export default function SideBarHeader() {
    const navegate = useNavigate();
    const popup_ctx = useContext(PopUpContext);
    const InviteCode = useRef<HTMLInputElement>(undefined!);
    const channel_context: ChannelContext = useContext(ChannelsContext);

    function JoinChannel(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        event.preventDefault()
        const inv_code = InviteCode.current.value;
        if (inv_code == "") {
            return
        }
        const url = Routes.Invites+`/${inv_code}`
        fetch(url, {
            method: "GET",
            }).then(response => {
                if (response.status === 200) {
                    response.json().then(channel => {
                        channel_context.setChannel(prevChannels => new Map(prevChannels.set(channel.id, channel)));
                        navegate(`/channels/${channel.id}`)
                    })
                }
            })
        
        InviteCode.current.value = ""
    }

    return (
        <div className='relative w-full flex flex-col p-2 border-b border-zinc-800'>
            <input className='h-6 border-none rounded bg-zinc-800 focus:outline-none' type="text" placeholder="Invite Code" ref={InviteCode} />
            <button className='bg-green-600 rounded-md h-6 hover:bg-green-700 my-2' onClick={JoinChannel}>Join Channel</button>
            <button className="bg-green-600 rounded-md h-6 hover:bg-green-700" onClick={() => popup_ctx.open(<CreateChannel />) }>Create Channel</button>
        </div>
  )
}
