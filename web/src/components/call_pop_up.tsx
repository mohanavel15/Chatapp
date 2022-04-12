import React, { useContext } from 'react'
import { CallContext, CallContextOBJ } from "../contexts/callcontexts";
import { setDefaultIcon } from '../utils/errorhandle';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faPhoneSlash } from '@fortawesome/free-solid-svg-icons'
import { ChannelsContext, ChannelContext } from "../contexts/channelctx";

function CallPopUp() {
    const call_ctx: CallContextOBJ = useContext(CallContext);
	const channel_context: ChannelContext = useContext(ChannelsContext);

	function answser() {
		call_ctx.setCall(true);
		call_ctx.setIncoming(true);

		call_ctx.peer_connection.createAnswer().then(answer => {
			call_ctx.peer_connection.setLocalDescription(answer);
			channel_context.gateway.send(
				JSON.stringify({
					event: "CALL_ANSWER",
					data: {
						channel_id: call_ctx.channel.uuid,
						sdp: answer.sdp,
					}
			}));
		});
	}

  	return (
		<div className="channel-container">
			<div className='call-pop-up'>
				<div className='call-pop-up-header'>
				<img className='channel-avatar' src={call_ctx.channel.icon} alt="channel_icon" onError={setDefaultIcon} />
				<h3>{call_ctx.channel.name}</h3>
				</div>
				<div className='call-pop-up-actions'>
				<button className='channel-header-action-button btn-green' onClick={answser}> <FontAwesomeIcon icon={faPhone} /> </button>
				<button className='channel-header-action-button btn-red' onClick={() => {call_ctx.setIncoming(false)}}> <FontAwesomeIcon icon={faPhoneSlash} /> </button>
				</div>
			</div>
		</div>
  	)
}

export default CallPopUp