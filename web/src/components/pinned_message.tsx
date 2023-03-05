import { useContext } from 'react';
import { MessageOBJ } from '../models/models';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from '@fortawesome/free-solid-svg-icons';
import { ChannelsContext, ChannelContext } from "../contexts/channelctx";
import Routes from '../config'
import { HiXMark } from 'react-icons/hi2';

export default function PinnedMessage({ message }: {message: MessageOBJ}) {
    const channel_ctx:ChannelContext = useContext(ChannelsContext);

    let date = new Date(message.created_at * 1000).toLocaleDateString();
    let time = new Date(message.created_at * 1000).toLocaleTimeString();


    function UnpinMsg() {
        const url = Routes.Channels + '/' + message.channel_id + '/pins/' + message.id;
        fetch(url, {
            method: 'DELETE'
        }).then(res => {
            if (res.status === 200) {
                channel_ctx.DeletePinnedMessage(message);
            }
        })
    }

    return (
        <div className='w-11/12 bg-zinc-800 mb-4 rounded p-2'>
            <div className='flex items-center justify-between'>
                <div className='flex items-center'><h4>{message.author.username}</h4> <p className='text-xs mx-4 text-zinc-500'>{time} - {date}</p></div>
                <button className='bg-neutral-500 rounded-full' onClick={UnpinMsg}>
                    <HiXMark />
                </button>
            </div>
            <div className='break-words'>
                <span>{message.content}</span>
            </div>
        </div>
    )
}