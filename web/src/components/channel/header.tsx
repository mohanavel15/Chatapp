import { setDefaultIcon, setDefaultAvatar } from '../../utils/errorhandle';
import { useContext, useState, useEffect } from 'react';
import { ChannelsContext, ChannelContext } from "../../contexts/channelctx";
import { StatesContext, StateContext } from "../../contexts/states";
import PinnedMessage from '../pinned_message';
import { ChannelOBJ } from '../../models/models';

import { BsArrowLeft, BsFillPinFill, BsPeopleFill, BsPersonPlusFill, BsThreeDotsVertical } from "react-icons/bs";
import { useNavigate } from 'react-router-dom';
import { PopUpContext } from '../../contexts/popup';
import EditChannel from '../popup/EditChannel';
import AddUser from '../popup/AddUser';

function Header({ channel, toggleRecipients }: { channel: ChannelOBJ, toggleRecipients: React.Dispatch<React.SetStateAction<boolean>> }) {
    const navigate = useNavigate()
    const channel_context: ChannelContext = useContext(ChannelsContext);
    const popup_ctx = useContext(PopUpContext);

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

    return (
        <div className='absolute w-full h-16 flex items-center px-6 border-b border-zinc-800'>
            <div className='w-1/2 flex items-center'>
                <BsArrowLeft size={32} className='lg:hidden cursor-pointer' onClick={() => { navigate("/channels") }} />
                <img className='h-10 w-10 rounded mx-4' src={ channel.type === 1 ? channel.recipients[0].avatar : channel.icon} alt="Avatar" onError={ channel.type === 1 ? setDefaultAvatar : setDefaultIcon } />
                <span className='text-lg'>{ channel.type === 1 ? channel.recipients[0].username : channel.name }</span>
            </div>
            <div className='w-1/2 flex items-center justify-end'>
            { channel.type === 2 && <BsPersonPlusFill className='mx-2 cursor-pointer' size={18} onClick={() => popup_ctx.open(<AddUser id={channel.id} />)} /> }
            { channel.type === 2 && <BsPeopleFill className='mx-2 cursor-pointer' size={18} onClick={() => toggleRecipients(p => !p)} /> }
            <BsFillPinFill className='mx-2 cursor-pointer' size={18} onClick={() => setShowPinnedMessage(p => !p)} />
            <BsThreeDotsVertical className='mx-2 cursor-pointer' size={18} onClick={() => popup_ctx.open(<EditChannel channel={channel} />)} />
            </div>
            { showPinnedMessage && 
                <div className='PinnedMessagesBox'>
                    {pinnedMessage}
                </div>
            }
        </div>
    )
}

export default Header;