import { useContext } from 'react'
import Routes from '../../config';
import { PopUpContext } from '../../contexts/popup';
import { MessageOBJ } from '../../models/models';

export default function DeleteMessage({ message }:{ message: MessageOBJ }) {
    const popup_ctx = useContext(PopUpContext);

    function HandleDeleteMessage() {
        const url = Routes.Channels+"/"+message.channel_id+"/messages/"+message.id;
        fetch(url, {
            method: "DELETE",
        });
        popup_ctx.close();
    }

    return (
        <div className='relative rounded-2xl p-8 text-white bg-zinc-900 min-h-fit w-80 flex flex-col items-center' onClick={(e) => e.stopPropagation()}>
            <h3>Delete Message</h3>
            <p>Are you sure you want to delete?</p>
            <div className='p-4'>
                <button className="rounded mx-2 bg-gray-500 text-white h-10 w-24 hover:bg-gray-600" onClick={() => popup_ctx.close()}>Cancel</button>
                <button className="rounded mx-2 bg-red-800 text-white h-10 w-24 hover:bg-red-900" onClick={HandleDeleteMessage}>Delete</button>
            </div>
        </div>
    )
}
