import { useState, useEffect } from 'react'
import Recipient from './Recipient';
import { ChannelOBJ } from '../../models/models';

export default function Recipients({ channel }: { channel: ChannelOBJ }) {
	const [recipients, setRecipients] = useState<JSX.Element[]>([]);

  	useEffect(() => {
    	setRecipients([])
		channel.recipients.forEach(recipient => {
			setRecipients(prevMembers => [...prevMembers, 
				<Recipient key={recipient.id} user={recipient} channel={channel} />
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
