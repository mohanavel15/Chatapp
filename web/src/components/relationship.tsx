import React, { useContext } from 'react'
import { Relationship as RelationshipOBJ } from '../models/relationship'
import { UserContext, UserContextOBJ } from '../contexts/usercontext'
import { ChannelsContext, ChannelContext } from '../contexts/channelctx';
import { useNavigate } from "react-router-dom";
import { ChannelOBJ } from '../models/models';
import { setDefaultAvatar } from '../utils/errorhandle';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle, faDotCircle, IconDefinition, faCheck, faX, faMessage } from '@fortawesome/free-solid-svg-icons';
import { RelationshipToDefault, RelationshipToFriend } from '../api/relationship';
import { DMUser } from '../utils/api';

export default function Relationship({ relationship_obj }: { relationship_obj: RelationshipOBJ }) {
  const user_ctx: UserContextOBJ = useContext(UserContext);
  const channel_ctx: ChannelContext = useContext(ChannelsContext);
  const navigate = useNavigate();

  let style: React.CSSProperties
  let icon: IconDefinition
  if (relationship_obj.status === 1) {
    style = {
      color: "lime"
    }
    icon = faCircle
  } else {
    style = {
      color: "grey"
    }
    icon = faDotCircle
  }

  function Accept() {
    RelationshipToFriend(user_ctx.accessToken, relationship_obj.id).then(res_relationship => {
      user_ctx.setRelationships(prevRelationships => new Map(prevRelationships.set(res_relationship.id, res_relationship)));
    })
  }

  function Decline() {
    RelationshipToDefault(user_ctx.accessToken, relationship_obj.id).then(res_relationship => {
      user_ctx.setRelationships(prevRelationships => new Map(prevRelationships.set(res_relationship.id, res_relationship)));
    })
  }

  function Message() {
    DMUser(user_ctx.accessToken, relationship_obj.id).then(response => {
      if (response.status === 200) {
        response.json().then(dm_channel => {
          if (!channel_ctx.channels.has(dm_channel.uuid)) {
            let channel: ChannelOBJ = dm_channel;
            channel.type = 0;
            channel_ctx.setChannel(prevChannels => new Map(prevChannels.set(channel.id, channel)));
          }
          navigate(`/channels/${dm_channel.uuid}`);
        })
      }
    })
  }

  return (
    <div className='Friend'>
      <div className='Friend-User'>
        <div className='Friend-Avatar-Container'>
          <img className='Friend-Avatar' src={relationship_obj.avatar} alt={"Avatar"} onError={setDefaultAvatar} />
          <FontAwesomeIcon className='Friend-Status' icon={icon} style={style} />
        </div>
        <h3 className='Friend-Name'>{relationship_obj.username}</h3>
      </div>
      <div className='Friend-Actions-Container'>
        {relationship_obj.type === 3 && <button className='Friend-Actions Friend-Actions-Accept' onClick={Accept}><FontAwesomeIcon icon={faCheck} /></button>}
        {relationship_obj.type === 4 && <button className='Friend-Actions Friend-Actions-Decline' onClick={Decline}><FontAwesomeIcon icon={faX} /></button>}
        {relationship_obj.type === 1 && <button className='Friend-Actions Friend-Actions-Decline' onClick={Decline}><FontAwesomeIcon icon={faX} /></button>}
        {relationship_obj.type === 1 && <button className='Friend-Actions Friend-Actions-Accept' onClick={Message}><FontAwesomeIcon icon={faMessage} /></button>}
      </div>
    </div>
  )
}