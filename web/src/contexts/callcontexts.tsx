import React, { useState, createContext, useEffect, useContext } from 'react'
import { ChannelOBJ } from "../models/models";
import { ChannelsContext, ChannelContext } from "./channelctx";
export interface CallContextOBJ {
    call: boolean;
    voice: boolean;
    video: boolean;
    Mute: boolean;
    Deafen: boolean;
    incoming: boolean;
    channel: ChannelOBJ;
    setCall: React.Dispatch<React.SetStateAction<boolean>>;
    setVoice: React.Dispatch<React.SetStateAction<boolean>>;
    setVideo: React.Dispatch<React.SetStateAction<boolean>>;
    setMute: React.Dispatch<React.SetStateAction<boolean>>;
    setDeafen: React.Dispatch<React.SetStateAction<boolean>>;
    setIncoming: React.Dispatch<React.SetStateAction<boolean>>;
    setChannel: React.Dispatch<React.SetStateAction<ChannelOBJ>>;
    localmedia: MediaStream | undefined;
    setLocalmedia: React.Dispatch<React.SetStateAction<MediaStream | undefined>>
    peer_connection: RTCPeerConnection;
}

export const CallContext = createContext<CallContextOBJ>(undefined!);

export default function CallCTX({ children }: {children: React.ReactChild}) {
    const [call, setCall] = useState(false)
    const [incoming, setIncoming] = useState(false)
    const [voice, setVoice] = useState(false)
    const [video, setVideo] = useState(false)
    const [Mute, setMute] = useState(false)
    const [Deafen, setDeafen] = useState(false)
    const [Channel, setChannel] = useState<ChannelOBJ>(undefined!)
    const [localmedia, setLocalmedia] = useState<MediaStream>()

	const channel_context: ChannelContext = useContext(ChannelsContext);

    const ice_servers = {
        iceServers: [
            {
                urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
            },
        ],
        iceCandidatePoolSize: 10,
    }
    const peer_connection = new RTCPeerConnection(ice_servers);
    useEffect(() => {
        if (localmedia) {
            localmedia.getTracks().forEach(track => {
                peer_connection.addTrack(track, localmedia)
            })
        }
    }, [localmedia])

    useEffect(() => {
        if (call) {
            peer_connection.createOffer().then(offer => {
                peer_connection.setLocalDescription(offer);
                console.log("CallCTX: createOffer: offer: ", offer);
                channel_context.gateway.send(
                    JSON.stringify({
                        event: "CALL_START",
                        data: {
                            channel_id: Channel.uuid,
                            sdp: offer.sdp,
                        }
                    })
                );
            })
        }
    }, [call])


    peer_connection.onicecandidate = (event) => {
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
        peer_connection: peer_connection,
    }
    

    return (
        <CallContext.Provider value={context_value} >
            {children}
        </CallContext.Provider>
    )
}