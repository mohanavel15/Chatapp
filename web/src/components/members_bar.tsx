import React, { useContext, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom';
import { ChannelsContext, ChannelContext } from "../contexts/channelctx";
import Member from './member';
export default function MembersBar() {
  const channel_context: ChannelContext = useContext(ChannelsContext);

  const parameter  = useParams<string>();
	let channel_id = parameter.id || "@me";

  const [reload, setReload] = useState(false)
  const [members, setMembers] = useState<JSX.Element[]>([]);

  useEffect(() => {
    setMembers([])
	console.log("channel id ......", channel_id);
    const member_objs = channel_context.members.get(channel_id);
	console.log("member objs ......", member_objs);
    if (member_objs) {
		member_objs.forEach(member => {
        	setMembers(prevMembers => [...prevMembers, <Member member_obj={member} />])
      	})
	}
    
  }, [channel_context.members, reload])

  return (
    <div className='member_bar'>
      <button onClick={() => { setReload(!reload) }}>reload</button>
	  <h3>Members—{members.length}</h3>
	  {members}
      </div>
  )
}
