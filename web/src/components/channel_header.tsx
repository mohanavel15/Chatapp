

interface ChannelHeaderProps {
    id: string;
}

function ChannelHeader(props: ChannelHeaderProps) {
    return (
        <div className='channel-header'>
            <img className='channel-avatar' src="/assets/default_avatar.jpeg" alt="Avatar" />
            <h2>{props.id}</h2>
        </div>
    )
}

export default ChannelHeader;