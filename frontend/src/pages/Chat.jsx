import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Typography, Box, TextField, IconButton, List, ListItem, ListItemText, Avatar } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useSelector } from 'react-redux';
import api from '../services/api';
import { getSocket } from '../services/socket';
import PageHeader from '../components/PageHeader';

export default function Chat() {
  const { userId: chatUserId } = useParams();
  const { user } = useSelector((state) => state.auth);
  const [message, setMessage] = useState('');
  const bottomRef = useRef();
  const queryClient = useQueryClient();

  const { data: conversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => api.get('/messages/conversations').then((r) => r.data.data),
  });

  const { data: messages } = useQuery({
    queryKey: ['messages', chatUserId],
    queryFn: () => api.get(`/messages/${chatUserId}`).then((r) => r.data.data),
    enabled: !!chatUserId,
    refetchInterval: 5000,
  });

  const sendMutation = useMutation({
    mutationFn: (content) => api.post('/messages', { receiverId: chatUserId, content }),
    onSuccess: () => {
      queryClient.invalidateQueries(['messages', chatUserId]);
      setMessage('');
    },
  });

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handler = (msg) => {
      if (msg.senderId._id === chatUserId || msg.receiverId === chatUserId) {
        queryClient.invalidateQueries(['messages', chatUserId]);
      }
    };
    socket.on('chat:message', handler);
    return () => socket.off('chat:message', handler);
  }, [chatUserId, queryClient]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const socket = getSocket();
    socket?.emit('chat:send', { receiverId: chatUserId, content: message });
    sendMutation.mutate(message);
  };

  return (
    <Box className="pt-16">
      <PageHeader title="Messages" />

      <Box className="flex gap-4 h-[calc(100vh-12rem)]">
        <Box className="card w-72 overflow-y-auto hidden md:block">
          <List>
            {conversations?.map((c) => (
              <ListItem
                key={c.user?._id}
                button
                component="a"
                href={`/chat/${c.user?._id}`}
                selected={chatUserId === c.user?._id}
              >
                <Avatar sx={{ mr: 2, width: 32, height: 32 }}>{c.user?.name?.[0]}</Avatar>
                <ListItemText primary={c.user?.name} secondary={c.lastMessage?.content?.slice(0, 30)} />
              </ListItem>
            ))}
          </List>
        </Box>

        <Box className="card flex-1 flex flex-col">
          {chatUserId ? (
            <>
              <Box className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages?.map((msg) => (
                  <Box
                    key={msg._id}
                    className={`flex ${msg.senderId === user._id || msg.senderId?._id === user._id ? 'justify-end' : 'justify-start'}`}
                  >
                    <Box className={`max-w-xs px-4 py-2 rounded-xl ${
                      msg.senderId === user._id || msg.senderId?._id === user._id
                        ? 'bg-primary-600 text-white' : 'bg-gray-100'
                    }`}>
                      {msg.content}
                    </Box>
                  </Box>
                ))}
                <div ref={bottomRef} />
              </Box>
              <form onSubmit={handleSend} className="flex gap-2 p-4 border-t">
                <TextField fullWidth size="small" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type a message..." />
                <IconButton type="submit" color="primary"><SendIcon /></IconButton>
              </form>
            </>
          ) : (
            <Typography className="m-auto text-gray-500">Select a conversation</Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
