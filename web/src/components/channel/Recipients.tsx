import { useContext, useState, useEffect } from 'react'
import Recipient from './Recipient';
import { ChannelOBJ } from '../../models/models';
import { ContextMenuCtx, ContextMenu } from "../../contexts/context_menu_ctx";

export default function Recipients({ channel }: { channel: ChannelOBJ }) {
	const ctx_menu_context: ContextMenuCtx = useContext(ContextMenu);
	const [recipients, setRecipients] = useState<JSX.Element[]>([]);

  	useEffect(() => {
    	setRecipients([])
		channel.recipients.forEach(recipient => {
			setRecipients(prevMembers => [...prevMembers, 
			<div key={recipient.id} onContextMenu={
				(event) => {
					event.preventDefault();
					ctx_menu_context.closeAll();
					ctx_menu_context.setMemberCtxMenu({event: event, member: recipient, channel: channel});
					ctx_menu_context.setShowMemberCtxMenu(true);
				}
			}>
			<Recipient user={recipient} isOwner={recipient.id == channel.owner_id} />
			</div>
		])
      	})
    
  }, [channel])

  return (
    <div className='justify-self-end hidden md:flex w-64 h-full border-l border-zinc-800 p-2 flex-col overflow-y-scroll'>
	  	<h3>Recipients—{recipients.length}</h3>
	    {recipients}
    </div>
  )
}
