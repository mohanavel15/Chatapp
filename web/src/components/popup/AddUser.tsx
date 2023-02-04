import { useContext, useEffect, useState } from 'react'
import { AddRecipient } from '../../api/recipient';
import { PopUpContext } from '../../contexts/popup';
import { UserContext } from '../../contexts/usercontext';
import { setDefaultAvatar } from '../../utils/errorhandle';

export default function AddUser({ id }: { id: string }) {
    const user_ctx = useContext(UserContext);
    const popup_ctx = useContext(PopUpContext);
    const [elements, setElements] = useState<JSX.Element[]>([]);
    const [username, setUsername] = useState<string>("");
    
    useEffect(() => {
		setElements([])
        user_ctx.relationships.forEach(r => {
            if (r.type == 1 && r.username.match(username)) {
                setElements(p => [...p,
                    <div className='flex w-full mb-2 items-center relative'>
                        <img src={r.avatar} className="h-8 w-8 rounded" alt="avatar" onError={setDefaultAvatar} />
                        <p className='mx-4 text-xl'>{r.username}</p>
                        <button className='absolute right-0 h-8 rounded hover:bg-green-600 px-2 border-green-600 border-2' onClick={() => AddRecipient(id, r.id).then(popup_ctx.close)}>Add</button>
                    </div>
                ])
            }
        })
	}, [user_ctx.relationships, username])

    return (
        <div className='relative rounded-2xl text-white bg-zinc-900 h-96 w-96 flex flex-col items-center p-6' onClick={e => e.stopPropagation()} defaultValue={username}>
            <input type="text" className='w-full bg-zinc-800 p-2 rounded-md' placeholder='username' onChange={e => setUsername(e.currentTarget.value)} />
            <div className='bg-zinc-800 w-full flex flex-col p-4 h-full rounded-md mt-6 overflow-y-scroll'>
                {elements}
            </div>
        </div>
    )
}
