import { ChannelOBJ, UserOBJ } from '../../models/models';
import { setDefaultAvatar } from '../../utils/errorhandle';
import { FaCrown } from "react-icons/fa";
import { RxDot, RxDotFilled } from "react-icons/rx"
import { useContext } from 'react';
import { ContextMenu } from '../../contexts/context_menu_ctx';
import MemberContextMenu from '../../contextmenu/member_context_menu';

export default function Recipient({ user, channel }: {user: UserOBJ, channel: ChannelOBJ }) {
    const ctx_menu = useContext(ContextMenu);

    return (
        <div className='h-12 flex items-center rounded hover:bg-zinc-900 cursor-pointer' onContextMenu={
                (event) => {
                    event.preventDefault();
                    ctx_menu.open(<MemberContextMenu x={event.clientX} y={event.clientY} channel={channel} member={user} />);
                }
            }>
            <div className='relative h-10 w-10 mx-4'>
            <img className='rounded-xl bg-zinc-900' src={user.avatar} onError={setDefaultAvatar} alt={"Icon"} />
            <div className='absolute right-0 bg-black rounded-full bottom-0'>
                { user.status === 1 ? <RxDotFilled size={20} className="text-green-600" /> : <RxDot size={20} className="text-gray-400" /> }
            </div>
            </div>
            <p>{user.username}</p>
            { channel.owner_id === user.id && <div className='text-yellow-500 mx-2'><FaCrown /></div> }
        </div>
    )
}