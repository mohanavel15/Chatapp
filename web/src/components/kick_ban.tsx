import { useContext, useRef } from 'react'
import { UserContextOBJ, UserContext } from "../contexts/usercontext";
import { StatesContext, StateContext } from "../contexts/states";
import Routes from '../config';

function KickBan() {
    const user_ctx:UserContextOBJ = useContext(UserContext);    
    const state_context: StateContext = useContext(StatesContext);
    const isBan = state_context.isBan

    const reasonRef = useRef<HTMLTextAreaElement>(null);

    function handleKickOrBan() {
        const url = Routes.Channels + "/" + "" + "/members/" + state_context.KickBanMember?.id;
        fetch(url, {
            method: "DELETE",
            headers: {
                "Authorization": user_ctx.accessToken,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "ban": isBan,
                "reason": reasonRef.current?.value
            })
        })
        cancelBan();
    }

    const cancelBan = () => {
        state_context.setShowKickBan(false)
        state_context.setIsBan(false)
        state_context.setKickBanMember(undefined)
    }

    return (
        <div className="channel-container">
            <div className='delete-channel'>
                <h3>{ isBan ? "Ban" : "Kick" }</h3>
                <p>Are you sure you want to { isBan ? "Ban" : "Kick" } <strong>{state_context.KickBanMember?.username}</strong>.</p>
                <textarea placeholder='Reason' ref={reasonRef} rows={5} cols={35} />
                <br />
                <button className="popupbox-btn" onClick={cancelBan}>Cancel</button>
                <button className="popupbox-btn-red popupbox-btn" onClick={handleKickOrBan}>{ isBan ? "Ban" : "Kick" }</button>
            </div>
        </div>
    )
}

export default KickBan