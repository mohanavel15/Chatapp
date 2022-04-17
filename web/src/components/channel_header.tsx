import { setDefaultIcon, setDefaultAvatar } from '../utils/errorhandle';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faPhoneSlash, faVideo, faVideoSlash, faMicrophone, faMicrophoneSlash, faUserGroup } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState, useContext } from 'react';
import { UserContextOBJ, UserContext } from "../contexts/usercontext";
import { CallContext, CallContextOBJ } from "../contexts/callcontexts";
import { ChannelOBJ, DMChannelOBJ } from "../models/models";
import { ChannelsContext, ChannelContext } from "../contexts/channelctx";
import { StatesContext, StateContext } from "../contexts/states";

function ChannelHeader({ channel_id, dm }: { channel_id: string, dm: boolean }) {
    const user:UserContextOBJ = useContext(UserContext);
    const call_ctx: CallContextOBJ = useContext(CallContext);
    const channel_context: ChannelContext = useContext(ChannelsContext);
    const state_context: StateContext = useContext(StatesContext);

    let channel: ChannelOBJ | undefined;
    let dm_channel: DMChannelOBJ | undefined;

    if (dm) {
        dm_channel = channel_context.DMChannels.get(channel_id);
    } else {
        channel = channel_context.channels.get(channel_id);
    }

    const [call, setCall] = useState(false);

    useEffect(() => {
        if (call_ctx.call === true) {
            if (dm_channel?.uuid === call_ctx.channel.uuid) {
                setCall(true);
            } else {
                setCall(false);
            }
        } else {
            setCall(false);
        }
    }, [call_ctx.call, channel]);

    async function start_call(video: boolean) {
        if (!dm_channel) {
            return;
        }
        
        call_ctx.setCall(true);
        call_ctx.setChannel(dm_channel);
        
        let local_stream = await navigator.mediaDevices.getUserMedia({ video: video, audio: true });
        call_ctx.setLocalmedia(local_stream);
        
        if (video) {
            call_ctx.setVideo(true);
        } else {
            call_ctx.setVoice(true);
        }

        call_ctx.peerConnection.createOffer().then(offer => {
            call_ctx.peerConnection.setLocalDescription(offer);
            channel_context.gateway.send(
                JSON.stringify({
                    event: "CALL_START",
                    data: {
                        channel_id: dm_channel?.uuid,
                        sdp: offer,
                    }
                })
            );
        })
    }

    async function end_call() {
        call_ctx.setCall(false);
        call_ctx.setVideo(false);
        if (call_ctx.localmedia) {
            call_ctx.localmedia.getTracks().forEach(track => {
                track.stop();
            });
        }
        call_ctx.setLocalmedia(undefined);
    }

    
    useEffect(() => {
        if (call_ctx.call) {
            if (call_ctx.video) {
                let local_video = document.getElementById("local-video") as HTMLVideoElement;
                if (call_ctx.voice === false) {
                    call_ctx.localmedia?.getVideoTracks().forEach(track => {
                        track.enabled = true;
                    });

                    if (call_ctx.localmedia) {
                        local_video.srcObject = call_ctx.localmedia;
                        local_video.play();
                    }
                } else {
                    call_ctx.setVoice(false);
                    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
                            call_ctx.setLocalmedia(stream);
                            setTimeout(() => {
                                if (call_ctx.localmedia) {
                                    local_video.srcObject = stream;
                                    local_video.play();
                                }
                            }, 1000);
                        }
                    );
                }

                
            } else {
                call_ctx.localmedia?.getVideoTracks().forEach(track => {
                    track.enabled = false;
                });

                let local_audio = document.getElementById("local-audio") as HTMLVideoElement;
                if (call_ctx.localmedia && local_audio) {
                    local_audio.srcObject = call_ctx.localmedia;
                    local_audio.play();
                }
            }

        }

    }, [call_ctx.call, call_ctx.video]);


    useEffect(() => {
        if (call_ctx.Mute) {
            call_ctx.localmedia?.getAudioTracks().forEach(track => {
                track.enabled = false;
            })
        }
        else {
            call_ctx.localmedia?.getAudioTracks().forEach(track => {
                track.enabled = true;
            })
        }
    }, [call_ctx.Mute]);

    return (
        <>
        { call === false &&
        <div className='channel-header'>
            <div className='channel-header-info'>
                { dm && <img className='channel-avatar' src={dm_channel?.recipient.avatar} alt="Avatar" onError={setDefaultAvatar} /> }
                { dm === false && <img className='channel-avatar' src={channel?.icon} alt="Avatar" onError={setDefaultIcon} /> }
                { dm && <h2>{dm_channel?.recipient.username}</h2> }
                { dm === false && <h2>{channel?.name}</h2> }
            </div>
            <div className='channel-header-actions'>
                { dm && <button className='channel-header-action-button' onClick={() => {start_call(false)}}><FontAwesomeIcon icon={faPhone} /></button> }
                { dm && <button className='channel-header-action-button' onClick={() => {start_call(true)}}><FontAwesomeIcon icon={faVideo} /></button> }
                { !dm && <button className='channel-header-action-button' onClick={() => {state_context.setShowMembers(!state_context.showMembers)}}><FontAwesomeIcon icon={faUserGroup} /></button> }
            </div>
        </div>
        }
        { call &&
        <div className='channel-header-call'>
            <div className='channel-header-call-info'>
                <div key={user.uuid}>
                { call_ctx.video === false && <><audio id="local-audio" autoPlay></audio><img id="local-voice" className='user-call-avatar' src={user.avatar} alt="Avatar" onError={setDefaultAvatar} /></> }
                { call_ctx.video && <video id="local-video" className='user-call-video-box' autoPlay playsInline></video> }
                </div>
                { call_ctx.users }
            </div>
            <div className='channel-header-call-actions'>
                { call_ctx.Mute === false && <button className='channel-header-action-button while-in-call' onClick={() => { call_ctx.setMute(true) }}><FontAwesomeIcon icon={faMicrophone} /></button> }
                { call_ctx.Mute && <button className='channel-header-action-button while-in-call' onClick={() => { call_ctx.setMute(false) }}><FontAwesomeIcon icon={faMicrophoneSlash} /></button> }
                <button className='channel-header-action-button while-in-call' onClick={() => { end_call() }}><FontAwesomeIcon icon={faPhoneSlash} /></button>
                { call_ctx.video === false && <button className='channel-header-action-button while-in-call' onClick={() => { call_ctx.setVideo(true) }}><FontAwesomeIcon icon={faVideo} /></button> }
                { call_ctx.video && <button className='channel-header-action-button while-in-call' onClick={() => { call_ctx.setVideo(false) }}><FontAwesomeIcon icon={faVideoSlash} /></button> }
            </div>
        </div>
        }
        </>
    )
}

export default ChannelHeader;