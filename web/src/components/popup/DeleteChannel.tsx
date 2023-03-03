import { useContext } from "react";
import { ChannelsContext } from "../../contexts/channelctx";
import { DeleteChannel as APIDeleteChannel } from "../../api/channel";
import { ChannelOBJ } from "../../models/models";
import { PopUpContext } from "../../contexts/popup";

export default function DeleteChannel({ channel }: { channel: ChannelOBJ }) {
    const channel_ctx = useContext(ChannelsContext);
    const popup_ctx = useContext(PopUpContext);

    function HandleDeleteChannel() {
        APIDeleteChannel(channel.id).then(response => {
            if (response.status === 200) {
                channel_ctx.deleteChannel(channel.id)
            }
        })
        popup_ctx.close()
    }

    return (
        <div onClick={(e) => e.stopPropagation()} className='relative rounded-2xl p-8 text-white bg-zinc-900 min-h-fit w-80 flex flex-col items-center'>
            <h3>Leave '{channel.name}'?</h3>
            <p>Are you sure you want to leave? You won't be able to re-join unless you are re-invited</p>
            <div className='p-4'>
                <button className="rounded mx-2 bg-gray-500 text-white h-10 w-24 hover:bg-gray-600" onClick={() => popup_ctx.close() }>Cancel</button>
                <button className="rounded mx-2 bg-red-800 text-white h-10 w-24 hover:bg-red-900" onClick={HandleDeleteChannel}>Leave</button>
            </div>
        </div>
    )
}