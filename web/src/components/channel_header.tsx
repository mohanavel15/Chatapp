interface ChannelHeaderProps {
    name: string;
    icon: string;
}

function ChannelHeader(props: ChannelHeaderProps) {
    return (
        <div className='channel-header'>
            <img className='channel-avatar' src={props.icon} alt="Avatar" />
            <h2>{props.name}</h2>
        </div>
    )
}

export default ChannelHeader;