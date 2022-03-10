import React, { useRef } from 'react'
import { useNavigate } from 'react-router-dom'

function SideTopBar() {
    const navegate = useNavigate();
    const InviteCode = useRef<HTMLInputElement>(undefined!);

    function JoinChannel(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        event.preventDefault()
        const inv_code = InviteCode.current.value
        console.log(inv_code)
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