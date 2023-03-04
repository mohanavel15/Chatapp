import { Link, useParams } from "react-router-dom";
import { setDefaultIcon, setDefaultAvatar } from '../utils/errorhandle';
import { ChannelOBJ } from "../models/models";
import { RxDot, RxDotFilled } from "react-icons/rx";
import { useContext } from "react";
import { ContextMenu } from "../contexts/context_menu_ctx";

export default function ChannelList({ channel }: { channel: ChannelOBJ }) {
    const parameter = useParams<string>();

    let isActive = parameter.id === channel.id;
    const isChannel = channel.type === 2;

    let icon: string;
    let name: string;
    let alt: string;
    let defaultIcon: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;
    
    if (isChannel) {
        icon = channel.icon;
        name = channel.name;
        alt = "Icon";
        defaultIcon = setDefaultIcon;
    } else {
        icon = channel.recipients[0].avatar;
        name = channel.recipients[0].username;
        alt = "Avatar";
        defaultIcon = setDefaultAvatar;
    }
    const ctx_menu = useContext(ContextMenu);

    return (
        <Link to={`/channels/${channel.id}`} className="linktag" onContextMenu={(event) => {
                event.preventDefault();
                ctx_menu.closeAll();
                ctx_menu.setChannelCtxMenu({ x: event.clientX, y: event.clientY, channel: channel })
                ctx_menu.setShowChannelCtxMenu(true);
            }}>
            <div className={`w-full h-12 px-2 mt-2 flex items-center cursor-pointer rounded ${isActive && 'bg-zinc-800'} hover:bg-zinc-900`}>
                <div className='relative h-10 w-10 mx-4'>
                    <img className='rounded-xl h-10 w-10 bg-zinc-900' src={icon} onError={defaultIcon} alt={alt} />
                    { !isChannel && <div className='absolute right-0 bg-black rounded-full bottom-0'>
                        {channel.recipients[0].status === 1 ? <RxDotFilled size={20} className="text-green-600" /> : <RxDot size={20} className="text-gray-400" />}
                    </div> }
                </div>
                <p className="w-28 h-6 overflow-hidden text-ellipsis whitespace-nowrap">{name}</p>
            </div>
        </Link>
    )
}
