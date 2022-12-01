import { setDefaultIcon, setDefaultAvatar } from '../../utils/errorhandle';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserGroup, faUserPlus, faThumbTack } from '@fortawesome/free-solid-svg-icons'
import { useContext, useState, useEffect } from 'react';
import { ChannelsContext, ChannelContext } from "../../contexts/channelctx";
import { StatesContext, StateContext } from "../../contexts/states";
import PinnedMessage from '../pinned_message';
import { ChannelOBJ } from '../../models/models';

import { BsArrowLeft } from "react-icons/bs";
import { useNavigate } from 'react-router-dom';

function Header({ channel }: { channel: ChannelOBJ }) {
    const navigate = useNavigate()
    const channel_context: ChannelContext = useContext(ChannelsContext);
    const state_context: StateContext = useContext(StatesContext);

    const [showPinnedMessage, setShowPinnedMessage] = useState(false);
    const [pinnedMessage, setPinnedMessage] = useState<JSX.Element[]>([]);

    useEffect(() => {
        setShowPinnedMessage(false);
    }, [channel]);

    useEffect(() => {
        setPinnedMessage([])
        if (showPinnedMessage) {
            const pin_channel = channel_context.pinnedMessages.get(channel.id);
            if (pin_channel !== undefined && pin_channel.length > 0) {
                pin_channel.forEach(msg => {
                    setPinnedMessage(prev => [...prev, <PinnedMessage key={msg.id} message={msg} />])
                });
            } else {
                setPinnedMessage([<h1 className='no-pinned-messages'>No Pinned Messages</h1>]);
            }
        }
    }, [showPinnedMessage, channel_context.pinnedMessages]);

    // return (
    //     <div className='channel-header'>
    //         <div className='channel-header-info'>
    //             { channel.type === 1 && <img className='channel-avatar' src={channel.recipients[0].avatar} alt="Avatar" onError={setDefaultAvatar} /> }
    //             { channel.type === 1 && <h2>{channel.recipients[0].username}</h2> }
    //             { channel.type === 2 && <img className='channel-avatar' src={channel.icon} alt="Avatar" onError={setDefaultIcon} /> }
    //             { channel.type === 2 && <h2>{channel.name}</h2> }
    //         </div>
    //         <div className='channel-header-actions'>
    //             <button aria-label='toggle show pinned messages' className='channel-header-action-button' onClick={() => { setShowPinnedMessage(p => !p)}}><FontAwesomeIcon icon={faThumbTack} /></button>
    //             { channel.type === 2 && <button className='channel-header-action-button' onClick={() => alert("Not Implemented In Front-End")}><FontAwesomeIcon icon={faUserPlus} /></button> }
    //             { channel.type === 2 && <button className='channel-header-action-button' onClick={() => {state_context.setShowMembers(!state_context.showMembers)}}><FontAwesomeIcon icon={faUserGroup} /></button> }
    //         </div>
    //         { showPinnedMessage && 
    //         <div className='PinnedMessagesBox'>
    //             {pinnedMessage}
    //         </div>
    //         }
    //     </div>
    // )
    return (
        <div className='absolute w-full h-16 flex items-center px-6 border-b border-zinc-800'>
            <BsArrowLeft size={32} className='lg:hidden' onClick={() => { navigate("/channels") }} />
            <div className='w-2/12 flex items-center justify-evenly'>
                <img className='h-10 w-10 rounded' src={ channel.type === 1 ? channel.recipients[0].avatar : channel.icon} alt="Avatar" onError={ channel.type === 1 ? setDefaultAvatar : setDefaultIcon } />
                <span className='text-lg'>{ channel.type === 1 ? channel.recipients[0].username : channel.name }</span>
            </div>
        </div>
    )
}

export default Header;