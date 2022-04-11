import { setDefaultIcon } from '../utils/errorhandle';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faPhoneSlash, faVideo, faVideoSlash, faMicrophone, faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState, useContext } from 'react';
import { StatesContext, StateContext } from "../contexts/states";
import { UserContextOBJ, UserContext } from "../contexts/usercontext";
import { CallContext, CallContextOBJ } from "../contexts/callcontexts";
interface ChannelHeaderProps {
    name: string;
    icon: string;
}

function ChannelHeader(props: ChannelHeaderProps) {
    const [call, setCall] = useState(false);
    const [video, setVideo] = useState(false);
    const user:UserContextOBJ = useContext(UserContext);
    const call_ctx: CallContextOBJ = useContext(CallContext);
    const state_context: StateContext = useContext(StatesContext);
    let [localStream, setLocalStream] = useState<MediaStream>();

    async function start_call(video: boolean) {
        setCall(true);
        
        let local_stream = await navigator.mediaDevices.getUserMedia({ video: video, audio: true });
        setLocalStream(local_stream);
        if (video) {
            setVideo(true);
        }

        if (!video) {
            let local_audio = document.getElementById("local-audio") as HTMLVideoElement;
            console.log("not video");
            console.log(localStream);
            console.log("playing audio");
            local_audio.srcObject = local_stream;
            local_audio.play();
        }

    }

    async function end_call() {
        setCall(false);
        setVideo(false);
        if (localStream) {
            localStream.getTracks().forEach(track => {
                track.stop();
            });
        }
        setLocalStream(undefined);
    }

    useEffect(() => {
        if (call) {
            if (video) {
                let local_video = document.getElementById("local-video") as HTMLVideoElement;
                localStream?.getVideoTracks().forEach(track => {
                    track.enabled = true;
                });

                if (localStream) {
                    local_video.srcObject = localStream;
                    local_video.play();
                }
            } else {
                localStream?.getVideoTracks().forEach(track => {
                    track.enabled = false;
                });

                let local_audio = document.getElementById("local-audio") as HTMLVideoElement;
                if (localStream && local_audio) {
                    local_audio.srcObject = localStream;
                    local_audio.play();
                }
            }

        }

    }, [call, video]);

    useEffect(() => {
        if (call_ctx.Mute) {
            localStream?.getAudioTracks().forEach(track => {
                track.enabled = false;
            })
        }
        else {
            localStream?.getAudioTracks().forEach(track => {
                track.enabled = true;
            })
        }
    }, [call_ctx.Mute]);

    return (
        <>
        { call === false &&
        <div className='channel-header'>
            <div className='channel-header-info'>
                <img className='channel-avatar' src={props.icon} alt="Avatar" onError={setDefaultIcon} />
                <h2>{props.name}</h2>
            </div>
            <div className='channel-header-actions'>
                <button className='channel-header-action-button' onClick={() => {start_call(false)}}><FontAwesomeIcon icon={faPhone} /></button>
                <button className='channel-header-action-button' onClick={() => {start_call(true)}}><FontAwesomeIcon icon={faVideo} /></button>
            </div>
        </div>
        }
        { call &&
        <div className='channel-header-call'>
            <div className='channel-header-call-info'>
                { video === false && <><audio id="local-audio" autoPlay></audio><img id="local-voice" className='user-call-avatar' src={user.avatar} alt="Avatar" onError={setDefaultIcon} /></> }
                { video && <video id="local-video" className='user-call-video-box' autoPlay playsInline></video> }
            </div>
            <div className='channel-header-call-actions'>
                { call_ctx.Mute === false && <button className='channel-header-action-button while-in-call' onClick={() => { call_ctx.setMute(true) }}><FontAwesomeIcon icon={faMicrophone} /></button> }
                { call_ctx.Mute && <button className='channel-header-action-button while-in-call' onClick={() => { call_ctx.setMute(false) }}><FontAwesomeIcon icon={faMicrophoneSlash} /></button> }
                <button className='channel-header-action-button while-in-call' onClick={() => { end_call() }}><FontAwesomeIcon icon={faPhoneSlash} /></button>
                { video === false && <button className='channel-header-action-button while-in-call' onClick={() => { setVideo(true) }}><FontAwesomeIcon icon={faVideo} /></button> }
                { video && <button className='channel-header-action-button while-in-call' onClick={() => { setVideo(false) }}><FontAwesomeIcon icon={faVideoSlash} /></button> }
            </div>
        </div>
        }
        </>
    )
}

export default ChannelHeader;