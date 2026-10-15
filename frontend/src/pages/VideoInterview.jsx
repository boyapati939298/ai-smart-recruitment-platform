import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Typography, Box, IconButton, Button } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import CallEndIcon from '@mui/icons-material/CallEnd';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { getSocket } from '../services/socket';
import LoadingSpinner from '../components/LoadingSpinner';

export default function VideoInterview() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const pcRef = useRef();
  const localStreamRef = useRef();
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [connected, setConnected] = useState(false);

  const { data: interview, isLoading } = useQuery({
    queryKey: ['interview-room', roomId],
    queryFn: () => api.get(`/interviews/room/${roomId}`).then((r) => r.data.data),
  });

  const otherUserId = interview?.candidateId?._id === user?._id
    ? interview?.recruiterId?._id
    : interview?.candidateId?._id;

  useEffect(() => {
    if (!interview || !otherUserId) return;

    const socket = getSocket();
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });
    pcRef.current = pc;

    const start = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.ontrack = (e) => {
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0];
        setConnected(true);
      };

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit('webrtc:ice-candidate', { roomId, candidate: e.candidate, targetUserId: otherUserId });
        }
      };

      socket.emit('webrtc:join-room', { roomId });

      socket.on('webrtc:offer', async ({ offer, from }) => {
        if (from !== otherUserId) return;
        await pc.setRemoteDescription(offer);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('webrtc:answer', { roomId, answer, targetUserId: from });
      });

      socket.on('webrtc:answer', async ({ answer, from }) => {
        if (from !== otherUserId) return;
        await pc.setRemoteDescription(answer);
      });

      socket.on('webrtc:ice-candidate', async ({ candidate, from }) => {
        if (from !== otherUserId) return;
        await pc.addIceCandidate(candidate);
      });

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('webrtc:offer', { roomId, offer, targetUserId: otherUserId });
    };

    start();

    return () => {
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      pc.close();
      socket.emit('webrtc:leave-room', { roomId });
    };
  }, [interview, otherUserId, roomId]);

  const toggleMute = () => {
    localStreamRef.current?.getAudioTracks().forEach((t) => { t.enabled = muted; });
    setMuted(!muted);
  };

  const toggleVideo = () => {
    localStreamRef.current?.getVideoTracks().forEach((t) => { t.enabled = videoOff; });
    setVideoOff(!videoOff);
  };

  const shareScreen = async () => {
    const screen = await navigator.mediaDevices.getDisplayMedia({ video: true });
    const sender = pcRef.current?.getSenders().find((s) => s.track?.kind === 'video');
    if (sender) await sender.replaceTrack(screen.getVideoTracks()[0]);
  };

  const endCall = () => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    navigate('/interviews');
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <Box className="pt-16">
      <Typography variant="h5" fontWeight={700} className="mb-4">
        {interview?.title || 'Video Interview'}
      </Typography>

      <Box className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Box className="relative bg-black rounded-xl overflow-hidden aspect-video">
          <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
          <Typography className="absolute bottom-2 left-2 text-white text-sm bg-black/50 px-2 rounded">You</Typography>
        </Box>
        <Box className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video">
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <Typography className="absolute bottom-2 left-2 text-white text-sm bg-black/50 px-2 rounded">
            {connected ? 'Remote' : 'Waiting...'}
          </Typography>
        </Box>
      </Box>

      <Box className="flex justify-center gap-4">
        <IconButton onClick={toggleMute} color={muted ? 'error' : 'primary'}>
          {muted ? <MicOffIcon /> : <MicIcon />}
        </IconButton>
        <IconButton onClick={toggleVideo} color={videoOff ? 'error' : 'primary'}>
          {videoOff ? <VideocamOffIcon /> : <VideocamIcon />}
        </IconButton>
        <IconButton onClick={shareScreen} color="primary"><ScreenShareIcon /></IconButton>
        <IconButton onClick={endCall} color="error"><CallEndIcon /></IconButton>
      </Box>
    </Box>
  );
}
