import React, { useContext, useEffect, useState } from 'react'
import { StatesContext, StateContext } from "../contexts/states";
import { UserContextOBJ, UserContext } from "../contexts/usercontext";
import { ChannelOBJ } from '../models/models';
import { RelationshipToDefault, RelationshipToFriend, RelationshipToBlock } from '../api/relationship';

interface propsChannelCtxProps {
    x: number, y: number, channel: ChannelOBJ
}

export default function ChannelContextMenu(props: propsChannelCtxProps) {
  	const state_context: StateContext = useContext(StatesContext);
  	const user_ctx:UserContextOBJ = useContext(UserContext);
    
  	let style: React.CSSProperties
  	style = {
        top: props.y,
        left: props.x
  	}

    const [relationshipStatus, setRelationshipStatus] = useState(0);

    const relationshipToDefault = () => {
        RelationshipToDefault(props.channel.recipients[0].id).then(relationship => {
            user_ctx.setRelationships(prevRel => new Map(prevRel.set(relationship.id, relationship)))
        })
    }

    const relationshipToFriend = () => {
        RelationshipToFriend(props.channel.recipients[0].id).then(relationship => {
            user_ctx.setRelationships(prevRel => new Map(prevRel.set(relationship.id, relationship)))
        })
    }

    const relationshipToBlock = () => {
        RelationshipToBlock(props.channel.recipients[0].id).then(relationship => {
            user_ctx.setRelationships(prevRel => new Map(prevRel.set(relationship.id, relationship)))
        })
    }
    
    useEffect(() => {
        if (props.channel.type === 1) {
            const relationship = user_ctx.relationships.get(props.channel.recipients[0].id)
            if (relationship === undefined) {
                setRelationshipStatus(0)
            } else {
                setRelationshipStatus(relationship.type)
            }
        }
    }, [props.channel, user_ctx.relationships])

    return (
    	<div className='ContextMenu' style={style}>
            { props.channel.type === 2 && props.channel.owner_id === user_ctx.id && <button className='CtxBtn' onClick={() =>{state_context.setChannelOBJ(props.channel);state_context.setEditChannel(true);}}>Edit Channel</button> }
            { props.channel.type === 2 && <button className='CtxDelBtn' onClick={() => {state_context.setChannelOBJ(props.channel);state_context.setDeleteChannel(true);}}>Leave Channel</button> }
            { props.channel.type === 1 && relationshipStatus === 0 && <button className='CtxBtn' onClick={relationshipToFriend}>Add Friend</button> }
            { props.channel.type === 1 && relationshipStatus === 3 && <button className='CtxDelBtn' onClick={relationshipToDefault}>Cancel Request</button> }
            { props.channel.type === 1 && relationshipStatus === 4 && <button className='CtxDelBtn' onClick={relationshipToDefault}>Decline Request</button> }
            { props.channel.type === 1 && relationshipStatus === 1 && <button className='CtxDelBtn' onClick={relationshipToDefault}>Remove Friend</button> }
            { props.channel.type === 1 && relationshipStatus !== 2 && <button className='CtxDelBtn' onClick={relationshipToBlock}>Block User</button> }
            { props.channel.type === 1 && relationshipStatus === 2 && <button className='CtxBtn' onClick={relationshipToDefault}>Unblock User</button> }
            <button className='CtxBtn' onClick={() => {navigator.clipboard.writeText(props.channel.id)}}>Copy ID</button>
        </div>
  )
}
