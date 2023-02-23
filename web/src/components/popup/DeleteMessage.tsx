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
        <div className='delete-channel' onClick={(e) => e.stopPropagation()}>
            <h3>Delete Message</h3>
            <p>Are you sure you want to delete?</p>
            <button className="popupbox-btn" onClick={() => popup_ctx.close()}>Cancel</button>
            <button className="popupbox-btn-red popupbox-btn" onClick={HandleDeleteMessage}>Delete</button>
        </div>
    )
}
