import React, { useState, createContext } from 'react'

export interface CallContextOBJ {
    call: boolean;
    video: boolean;
    Mute: boolean;
    Deafen: boolean;
    setCall: React.Dispatch<React.SetStateAction<boolean>>;
    setVideo: React.Dispatch<React.SetStateAction<boolean>>;
    setMute: React.Dispatch<React.SetStateAction<boolean>>;
    setDeafen: React.Dispatch<React.SetStateAction<boolean>>;
    localmedia: MediaStream
    setLocalmedia: React.Dispatch<React.SetStateAction<MediaStream>>
    peer_connection: RTCPeerConnection;
}

export const CallContext = createContext<CallContextOBJ>(undefined!);

export default function CallCTX({ children }: {children: React.ReactChild}) {
    const [call, setCall] = useState(false)
    const [video, setVideo] = useState(false)
    const [Mute, setMute] = useState(false)
    const [Deafen, setDeafen] = useState(false)
    const [localmedia, setLocalmedia] = useState<MediaStream>(undefined!)

    const ice_servers = {
        iceServers: [
            {
                urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
            },
        ],
        iceCandidatePoolSize: 10,
    }
    const peer_connection = new RTCPeerConnection(ice_servers);

    const context_value: CallContextOBJ = {
        call: call,
        video: video,
        Mute: Mute,
        Deafen: Deafen,
        setMute: setMute,
        setDeafen: setDeafen,
        setCall: setCall,
        setVideo: setVideo,
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