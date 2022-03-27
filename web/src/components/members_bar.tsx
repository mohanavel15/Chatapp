import React, { useContext, useState, useEffect } from 'react'
import { ChannelsContext, ChannelContext } from "../contexts/channelctx";
import Member from './member';
import { ChannelOBJ } from '../models/models';
import { ContextMenuCtx, ContextMenu } from "../contexts/context_menu_ctx";

export default function MembersBar({ channel }: { channel: ChannelOBJ }) {
  const channel_context: ChannelContext = useContext(ChannelsContext);
	const ctx_menu_context: ContextMenuCtx = useContext(ContextMenu);

	let channel_id = channel.uuid;
  const [members, setMembers] = useState<JSX.Element[]>([]);

  useEffect(() => {
    setMembers([])
	console.log("channel id ......", channel_id);
    const member_objs = channel_context.members.get(channel_id);
	console.log("member objs ......", member_objs);
    if (member_objs) {
		member_objs.forEach(member => {
        	setMembers(prevMembers => [...prevMembers, 
          <div onContextMenu={
            (event) => {
              		event.preventDefault();
					ctx_menu_context.setShowMsgCtxMenu(false);
					ctx_menu_context.setShowChannelCtxMenu(false);
					ctx_menu_context.setShowMemberCtxMenu(false);
              		ctx_menu_context.setMemberCtxMenuLocation({event: event, member: member, channel: channel});
					ctx_menu_context.setShowMemberCtxMenu(true);
        	}
          }>
          <Member key={member.uuid} member_obj={member} />
          </div>
        ])
      	})
	}
    
  }, [channel_context.membersLoaded, channel])

  return (
    <div className='member_bar'>
	  <h3>Members—{members.length}</h3>
	    {members}
    </div>
  )
}
