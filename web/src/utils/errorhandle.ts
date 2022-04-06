function setDefaultAvatar(event : React.SyntheticEvent<HTMLImageElement, Event>) {
    event.currentTarget.src = "/assets/default_avatar.jpeg";
}

function setDefaultIcon(event : React.SyntheticEvent<HTMLImageElement, Event>) {
    event.currentTarget.src = "/assets/channel_icon.svg";
}

export { setDefaultIcon, setDefaultAvatar };