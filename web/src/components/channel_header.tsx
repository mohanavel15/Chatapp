import { setDefaultIcon, setDefaultAvatar } from '../utils/errorhandle';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserGroup } from '@fortawesome/free-solid-svg-icons'
import { useContext } from 'react';
import { ChannelsContext, ChannelContext } from "../contexts/channelctx";
import { StatesContext, StateContext } from "../contexts/states";

function ChannelHeader({ channel_id }: { channel_id: string }) {
    const channel_context: ChannelContext = useContext(ChannelsContext);
    const state_context: StateContext = useContext(StatesContext);

    const channel = channel_context.channels.get(channel_id);

    return (
        <div className='channel-header'>
            <div className='channel-header-info'>
                { channel?.type === 0 && <img className='channel-avatar' src={channel?.recipient.avatar} alt="Avatar" onError={setDefaultAvatar} /> }
                { channel?.type === 1 && <img className='channel-avatar' src={channel?.icon} alt="Avatar" onError={setDefaultIcon} /> }
                { channel?.type === 0 && <h2>{channel?.recipient.username}</h2> }
                { channel?.type === 1 && <h2>{channel?.name}</h2> }
            </div>
            <div className='channel-header-actions'>
                { channel?.type === 1 && <button className='channel-header-action-button' onClick={() => {state_context.setShowMembers(!state_context.showMembers)}}><FontAwesomeIcon icon={faUserGroup} /></button> }
            </div>
        </div>
    )
}

export default ChannelHeader;