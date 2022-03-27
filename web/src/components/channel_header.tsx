interface ChannelHeaderProps {
    name: string;
    icon: string;
}

function ChannelHeader(props: ChannelHeaderProps) {
    function setDefaultIcon(event : React.SyntheticEvent<HTMLImageElement, Event>) {
        event.currentTarget.src = "/assets/channel_icon.svg";

    }

    return (
        <div className='channel-header'>
            <img className='channel-avatar' src={props.icon} alt="Avatar" onError={setDefaultIcon} />
            <h2>{props.name}</h2>
        </div>
    )
}

export default ChannelHeader;