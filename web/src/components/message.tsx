import React from "react";

interface MessageProps {
    message: string;
    avatar: string;
    name: string;
}

function Message(props: MessageProps) {

    function setDefaultAvatar(event : React.SyntheticEvent<HTMLImageElement, Event>) {
        event.currentTarget.src = "/assets/default_avatar.jpeg";
    }

    function HandleClick(ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        alert("<h1> TEST </h1>");
    }

    return (
    <div className="Message">
        <img id="Message-avatar" src={props.avatar} alt="Avatar" onError={setDefaultAvatar} />
        <div id="Message-text"> 
            <p> {props.name} </p>
            <p> {props.message} </p> 
        </div>
        <button id="Message-button" onClick={HandleClick}>...</button>
    </div>
);
}
  
export default Message;