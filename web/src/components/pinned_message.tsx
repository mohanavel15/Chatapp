import { useContext } from 'react';
import { MessageOBJ } from '../models/models';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from '@fortawesome/free-solid-svg-icons';
import { UserContextOBJ, UserContext } from "../contexts/usercontext";
import { ChannelsContext, ChannelContext } from "../contexts/channelctx";
import Routes from '../config'

function PinnedMessage({ message }: {message: MessageOBJ}) {
    const user_ctx:UserContextOBJ = useContext(UserContext);
    const channel_ctx:ChannelContext = useContext(ChannelsContext);

    let date = new Date(message.created_at * 1000).toLocaleDateString();
    let time = new Date(message.created_at * 1000).toLocaleTimeString();


    function UnpinMsg() {
        const url = Routes.Channels + '/' + message.channel_id + '/pins/' + message.id;
        fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': user_ctx.accessToken
            }
        }).then(res => {
            if (res.status === 200) {
                channel_ctx.DeletePinnedMessage(message);
            }
        })
    }

    return (
        <div className='PinnedMessage'>
            <div className='PinnedMessage-header'>
                <div className='PinnedMessage-header'><h4>{message.author.username}</h4> <p className='message-time'>{time} - {date}</p></div>
                <button className='PinnedMessage-header-actions-btn' onClick={UnpinMsg}>
                    <FontAwesomeIcon icon={faX}/>
                </button>
            </div>
            <div className='PinnedMessage-body'>
                <span>{message.content}</span>
            </div>
        </div>
    )
}

export default PinnedMessage