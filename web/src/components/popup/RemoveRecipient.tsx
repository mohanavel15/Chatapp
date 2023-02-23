import { useContext, useRef } from 'react'
import { RemoveRecipient as APIRemoveRecipient } from '../../api/recipient';
import { ChannelOBJ, UserOBJ } from '../../models/models';
import { PopUpContext } from '../../contexts/popup';

export default function RemoveRecipient({ isBan, recipient, channel }: {isBan: boolean, recipient: UserOBJ, channel: ChannelOBJ }) {
    const popup_ctx = useContext(PopUpContext);
    const reasonRef = useRef<HTMLTextAreaElement>(undefined!);

    function handleKickOrBan() {
        APIRemoveRecipient(channel.id, recipient.id, reasonRef.current.value, isBan);
        popup_ctx.close();
    }

    return (
            <div className='delete-channel' onClick={e => e.stopPropagation()}>
                <h3>{ isBan ? "Ban" : "Kick" }</h3>
                <p>Are you sure you want to { isBan ? "Ban" : "Kick" } <strong>{recipient.username}</strong>.</p>
                <textarea placeholder='Reason' ref={reasonRef} rows={5} cols={35} />
                <br />
                <button className="popupbox-btn" onClick={() => popup_ctx.close()}>Cancel</button>
                <button className="popupbox-btn-red popupbox-btn" onClick={handleKickOrBan}>{ isBan ? "Ban" : "Kick" }</button>
            </div>
    )
}