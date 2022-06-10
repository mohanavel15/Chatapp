import { setDefaultIcon, setDefaultAvatar } from '../utils/errorhandle';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserGroup, faThumbTack } from '@fortawesome/free-solid-svg-icons'
import { useContext, useState, useEffect } from 'react';
import { ChannelsContext, ChannelContext } from "../contexts/channelctx";
import { StatesContext, StateContext } from "../contexts/states";
import PinnedMessage from './pinned_message';

function ChannelHeader({ channel_id }: { channel_id: string }) {
    const channel_context: ChannelContext = useContext(ChannelsContext);
    const state_context: StateContext = useContext(StatesContext);

    const channel = channel_context.channels.get(channel_id);
    const [showPinnedMessage, setShowPinnedMessage] = useState(false);
    const [pinnedMessage, setPinnedMessage] = useState<JSX.Element[]>([]);

    useEffect(() => {
        setShowPinnedMessage(false);
    }, [channel_id]);

    useEffect(() => {
        setPinnedMessage([])
        if (showPinnedMessage) {
            const pin_channel = channel_context.pinnedMessages.get(channel_id);
            if (pin_channel !== undefined && pin_channel.size > 0) {
                pin_channel.forEach(msg => {
                    setPinnedMessage(prev => [...prev, <PinnedMessage key={msg.id} message={msg} />])
                });
            } else {
                setPinnedMessage([<h1 className='no-pinned-messages'>No Pinned Messages</h1>]);
            }
        }
    }, [showPinnedMessage, channel_context.pinnedMessages]);

    return (
        <div className='channel-header'>
            <div className='channel-header-info'>
                { channel?.type === 1 && <img className='channel-avatar' src={channel?.recipients[0].avatar} alt="Avatar" onError={setDefaultAvatar} /> }
                { channel?.type === 1 && <h2>{channel?.recipients[0].username}</h2> }
                { channel?.type === 2 && <img className='channel-avatar' src={channel?.icon} alt="Avatar" onError={setDefaultIcon} /> }
                { channel?.type === 2 && <h2>{channel?.name}</h2> }
            </div>
            <div className='channel-header-actions'>
                <button className='channel-header-action-button' onClick={() => { setShowPinnedMessage(p => !p)}}><FontAwesomeIcon icon={faThumbTack} /></button>
                { channel?.type === 2 && <button className='channel-header-action-button' onClick={() => {state_context.setShowMembers(!state_context.showMembers)}}><FontAwesomeIcon icon={faUserGroup} /></button> }
            </div>
            { showPinnedMessage && 
            <div className='PinnedMessagesBox'>
                {pinnedMessage}
            </div>
            }
        </div>
    )
}

export default ChannelHeader;