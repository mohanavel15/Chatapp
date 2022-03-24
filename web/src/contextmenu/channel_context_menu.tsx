import React from 'react'

import { ChannelOBJ } from '../models/models';

interface propsChannelCtxProps {
    location: {x: number, y: number, channel: ChannelOBJ},
}

export default function ChannelContextMenu(props: propsChannelCtxProps) {
  let style: React.CSSProperties
  style = {
        top: props.location.y,
        left: props.location.x
  }
  return (
    <div className='ContextMenu' style={style}>
        <button className='CtxBtn'>Edit Channel</button>
        <button className='CtxDelBtn'>Leave Channel</button>
        <button className='CtxBtn' onClick={() => {navigator.clipboard.writeText(props.location.channel.uuid)}}>Copy ID</button>
    </div>
  )
}
