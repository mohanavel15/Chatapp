import React from 'react'
import ChannelList from './channel_list'

export default function ChannelBar() {
  return (
    <div className='ChannelBar'>
        <ChannelList id="Hey" />
        <ChannelList id="Hi" />
        <ChannelList id="Bye" />
    </div>
  )
}
