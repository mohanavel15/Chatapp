import { useContext } from 'react'
import { Relationship as RelationshipOBJ } from '../../models/relationship'
import { UserContext, UserContextOBJ } from '../../contexts/usercontext'
import { ChannelsContext, ChannelContext } from '../../contexts/channelctx';
import { useNavigate } from "react-router-dom";
import { ChannelOBJ } from '../../models/models';
import { setDefaultAvatar } from '../../utils/errorhandle';
import { RelationshipToDefault, RelationshipToFriend } from '../../api/relationship';
import { GetDMChannel } from '../../api/channel';
import { ContextMenu } from '../../contexts/context_menu_ctx';
import { RxDot, RxDotFilled } from "react-icons/rx";
import { FaCheck } from 'react-icons/fa';
import { AiTwotoneMessage } from 'react-icons/ai';
import { HiXMark } from 'react-icons/hi2';

export default function Relationship({ relationship_obj }: { relationship_obj: RelationshipOBJ }) {
  const user_ctx: UserContextOBJ = useContext(UserContext);
  const channel_ctx: ChannelContext = useContext(ChannelsContext);
  const ctx_menu = useContext(ContextMenu);
  const navigate = useNavigate();

  function Accept() {
    RelationshipToFriend(relationship_obj.id).then(res_relationship => {
      user_ctx.setRelationships(prevRelationships => new Map(prevRelationships.set(res_relationship.id, res_relationship)));
    })
  }

  function Decline() {
    RelationshipToDefault(relationship_obj.id).then(res_relationship => {
      user_ctx.setRelationships(prevRelationships => new Map(prevRelationships.set(res_relationship.id, res_relationship)));
    })
  }

  function Message() {
    GetDMChannel(relationship_obj.id).then(response => {
      if (response.status === 200) {
        response.json().then(dm_channel => {
          if (!channel_ctx.channels.has(dm_channel.id)) {
            let channel: ChannelOBJ = dm_channel;
            channel_ctx.setChannel(prevChannels => new Map(prevChannels.set(channel.id, channel)));
          }
          navigate(`/channels/${dm_channel.id}`);
        })
      }
    })
  }

  return (
    <div className='h-12 w-3/5 flex items-center rounded border-b border-zinc-800 hover:bg-neutral-900' onContextMenu={(event) => {
      event.preventDefault();
      ctx_menu.closeAll();
      ctx_menu.setFriendCtxMenu({x: event.clientX, y: event.clientY, friend_obj: relationship_obj})
      ctx_menu.setShowFriendCtxMenu(true);
    }}>
      <div className='flex w-1/2 items-center'>
        <div className='relative h-10 w-10 mx-4'>
          <img className='rounded-xl bg-zinc-900' src={relationship_obj.avatar} onError={setDefaultAvatar} alt={"Icon"} />
          <div className='absolute right-0 bg-black rounded-full bottom-0'>
            { relationship_obj.status === 1 ? <RxDotFilled size={20} className="text-green-600" /> : <RxDot size={20} className="text-gray-400" /> }
          </div>
        </div>
        <h3 className='text-lg text-neutral-500'>{relationship_obj.username}</h3>
      </div>
      <div className='flex w-1/2 items-center justify-end'>
        { relationship_obj.type === 3 && <button className='h-10 w-10 rounded bg-zinc-800 text-green-500 flex items-center justify-center' onClick={Accept}><FaCheck size={24} /></button> }
        { relationship_obj.type === 1 && <button className='h-10 w-10 rounded bg-zinc-800 text-green-500 flex items-center justify-center' onClick={Message}><AiTwotoneMessage size={24} /></button> }
        <button className='h-10 w-10 rounded bg-zinc-800 text-red-500 flex items-center justify-center mx-1' onClick={Decline}><HiXMark size={24} /></button>
      </div>
    </div>
  )
}
