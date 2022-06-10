import { useContext, useState, useEffect } from 'react'
import { ChannelsContext, ChannelContext } from "../contexts/channelctx";
import Member from './member';
import { ChannelOBJ } from '../models/models';
import { ContextMenuCtx, ContextMenu } from "../contexts/context_menu_ctx";

export default function MembersBar({ channel }: { channel: ChannelOBJ }) {
	const channel_context: ChannelContext = useContext(ChannelsContext);
	const ctx_menu_context: ContextMenuCtx = useContext(ContextMenu);
	const [members, setMembers] = useState<JSX.Element[]>([]);

  	useEffect(() => {
    	setMembers([])
		channel.recipients.forEach(recipient => {
			setMembers(prevMembers => [...prevMembers, 
			<div key={recipient.id} onContextMenu={
				(event) => {
					event.preventDefault();
					ctx_menu_context.closeAll();
					ctx_menu_context.setMemberCtxMenu({event: event, member: recipient, channel: channel});
					ctx_menu_context.setShowMemberCtxMenu(true);
				}
			}>
			<Member member_obj={recipient} channel_obj={channel} />
			</div>
		])
      	})
    
  }, [channel])

  return (
    <div className='member_bar'>
	  	<h3>Members—{members.length}</h3>
	    {members}
    </div>
  )
}
