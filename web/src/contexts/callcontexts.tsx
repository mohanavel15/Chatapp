import React, { useState, createContext, useEffect, useContext } from 'react'
import { DMChannelOBJ } from "../models/models";
import { ChannelsContext, ChannelContext } from "./channelctx";
export interface CallContextOBJ {
    call: boolean;
    voice: boolean;
    video: boolean;
    Mute: boolean;
    Deafen: boolean;
    incoming: boolean;
    channel: DMChannelOBJ;
    setCall: React.Dispatch<React.SetStateAction<boolean>>;
    setVoice: React.Dispatch<React.SetStateAction<boolean>>;
    setVideo: React.Dispatch<React.SetStateAction<boolean>>;
    setMute: React.Dispatch<React.SetStateAction<boolean>>;
    setDeafen: React.Dispatch<React.SetStateAction<boolean>>;
    setIncoming: React.Dispatch<React.SetStateAction<boolean>>;
    setChannel: React.Dispatch<React.SetStateAction<DMChannelOBJ>>;
    localmedia: MediaStream | undefined;
    setLocalmedia: React.Dispatch<React.SetStateAction<MediaStream | undefined>>
    peerConnection: RTCPeerConnection;
    offer: RTCSessionDescriptionInit | undefined
    setOffer: React.Dispatch<React.SetStateAction<RTCSessionDescriptionInit | undefined>>
    remoteSDP: RTCSessionDescriptionInit | undefined
    setRemoteSDP: React.Dispatch<React.SetStateAction<RTCSessionDescriptionInit | undefined>>
    users: JSX.Element[]
    setUsers: React.Dispatch<React.SetStateAction<JSX.Element[]>>
}

export const CallContext = createContext<CallContextOBJ>(undefined!);

export default function CallCTX({ children }: {children: React.ReactChild}) {
    const [call, setCall] = useState(false)
    const [incoming, setIncoming] = useState(false)
    const [voice, setVoice] = useState(false)
    const [video, setVideo] = useState(false)
    const [Mute, setMute] = useState(false)
    const [Deafen, setDeafen] = useState(false)
    const [Channel, setChannel] = useState<DMChannelOBJ>(undefined!)
    const [localmedia, setLocalmedia] = useState<MediaStream>()
    const [remoteMedia, setRemoteMedia] = useState<MediaStream>(new MediaStream())
    const [offer, setOffer] = useState<RTCSessionDescriptionInit>()
    const [remoteSDP, setRemoteSDP] = useState<RTCSessionDescriptionInit>()
    const [users, setAUsers] = useState<JSX.Element[]>([])

	const channel_context: ChannelContext = useContext(ChannelsContext);

    const ice_servers = {
        iceServers: [
            {
                urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
            },
        ],
        iceCandidatePoolSize: 10,
    }
    const peerConnection = new RTCPeerConnection(ice_servers)
    useEffect(() => {
        if (localmedia) {
            localmedia.getTracks().forEach(track => {
                peerConnection.addTrack(track, localmedia)
            })
        }
    }, [localmedia])

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            channel_context.gateway.send(
                JSON.stringify({
                    event: "ICE_CANDIDATE",
                    data: {
                        channel_id: Channel.uuid,
                        candidate: event.candidate,
                    }
                })
            )
        }
    }

    peerConnection.ontrack = (event) => {
        event.streams.forEach(stream => {
            console.log("got stream");
            stream.getTracks().forEach(track => {
                setRemoteMedia((r) => { r.addTrack(track); return r })
            })
        })
    }

    useEffect(() => {
        if (remoteSDP) {
            peerConnection.setRemoteDescription(remoteSDP)
        }
    }, [remoteSDP])

    useEffect(() => {
        if (call) {
            const remote_call_audio = document.getElementById('remote-call-audio') as HTMLVideoElement;
            if (remote_call_audio) {
                console.log('remote_call_audio');
                remote_call_audio.srcObject = remoteMedia;
                remote_call_audio.play();
            }
        }
    }, [remoteMedia])

    const context_value: CallContextOBJ = {
        call: call,
        voice: voice,
        video: video,
        Mute: Mute,
        Deafen: Deafen,
        channel: Channel,
        incoming: incoming,
        setMute: setMute,
        setDeafen: setDeafen,
        setCall: setCall,
        setVoice: setVoice,
        setVideo: setVideo,
        setChannel: setChannel,
        setIncoming: setIncoming,
        localmedia: localmedia,
        setLocalmedia: setLocalmedia,
        peerConnection: peerConnection,
        offer: offer,
        setOffer: setOffer,
        remoteSDP: remoteSDP,
        setRemoteSDP: setRemoteSDP,
        users: users,
        setUsers: setAUsers,
    }
    

    return (
        <CallContext.Provider value={context_value} >
            {children}
        </CallContext.Provider>
    )
}