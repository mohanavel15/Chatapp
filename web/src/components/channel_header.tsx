import { setDefaultIcon, setDefaultAvatar } from '../utils/errorhandle';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserGroup } from '@fortawesome/free-solid-svg-icons'
import { useContext } from 'react';
import { ChannelOBJ, DMChannelOBJ } from "../models/models";
import { ChannelsContext, ChannelContext } from "../contexts/channelctx";
import { StatesContext, StateContext } from "../contexts/states";

function ChannelHeader({ channel_id, dm }: { channel_id: string, dm: boolean }) {
    const channel_context: ChannelContext = useContext(ChannelsContext);
    const state_context: StateContext = useContext(StatesContext);

    let channel: ChannelOBJ | undefined;
    let dm_channel: DMChannelOBJ | undefined;

    if (dm) {
        dm_channel = channel_context.DMChannels.get(channel_id);
    } else {
        channel = channel_context.channels.get(channel_id);
    }

    return (
        <div className='channel-header'>
            <div className='channel-header-info'>
                { dm && <img className='channel-avatar' src={dm_channel?.recipient.avatar} alt="Avatar" onError={setDefaultAvatar} /> }
                { dm === false && <img className='channel-avatar' src={channel?.icon} alt="Avatar" onError={setDefaultIcon} /> }
                { dm && <h2>{dm_channel?.recipient.username}</h2> }
                { dm === false && <h2>{channel?.name}</h2> }
            </div>
            <div className='channel-header-actions'>
                { !dm && <button className='channel-header-action-button' onClick={() => {state_context.setShowMembers(!state_context.showMembers)}}><FontAwesomeIcon icon={faUserGroup} /></button> }
            </div>
        </div>
    )
}

export default ChannelHeader;