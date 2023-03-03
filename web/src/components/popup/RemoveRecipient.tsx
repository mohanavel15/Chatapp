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
            <div className='relative rounded-2xl p-8 text-white bg-zinc-900 min-h-fit w-80 flex flex-col items-center' onClick={e => e.stopPropagation()}>
                <h3>{ isBan ? "Ban" : "Kick" }</h3>
                <p>Are you sure you want to { isBan ? "Ban" : "Kick" } <strong>{recipient.username}</strong>.</p>
                <textarea placeholder='Reason' ref={reasonRef} rows={3} cols={16} />
                <br />
                <div className='p-4 flex'>
                <button className="rounded mx-2 bg-gray-500 text-white h-10 w-24 hover:bg-gray-600" onClick={() => popup_ctx.close()}>Cancel</button>
                <button className="rounded mx-2 bg-red-800 text-white h-10 w-24 hover:bg-red-900" onClick={handleKickOrBan}>{ isBan ? "Ban" : "Kick" }</button>
                </div>
            </div>
    )
}