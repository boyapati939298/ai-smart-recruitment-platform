import Message from '../models/Message.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { verifyAccessToken } from '../utils/jwt.js';
import logger from '../utils/logger.js';

const onlineUsers = new Map();

export const initSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) return next(new Error('Authentication required'));

      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error('User not found'));

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.user._id.toString();
    onlineUsers.set(userId, socket.id);

    await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() });
    io.emit('user:online', { userId, isOnline: true });

    socket.join(`user:${userId}`);

    socket.on('chat:send', async ({ receiverId, content, jobId }) => {
      const message = await Message.create({
        senderId: userId,
        receiverId,
        content,
        jobId,
      });

      const populated = await message.populate('senderId', 'name profileImage');

      io.to(`user:${receiverId}`).emit('chat:message', populated);
      socket.emit('chat:message', populated);

      await Notification.create({
        userId: receiverId,
        message: `New message from ${socket.user.name}`,
        type: 'message',
        metadata: { senderId: userId },
      });

      io.to(`user:${receiverId}`).emit('notification:new', {
        message: `New message from ${socket.user.name}`,
        type: 'message',
      });
    });

    socket.on('chat:typing', ({ receiverId }) => {
      io.to(`user:${receiverId}`).emit('chat:typing', { userId, name: socket.user.name });
    });

    socket.on('webrtc:offer', ({ roomId, offer, targetUserId }) => {
      io.to(`user:${targetUserId}`).emit('webrtc:offer', { roomId, offer, from: userId });
    });

    socket.on('webrtc:answer', ({ roomId, answer, targetUserId }) => {
      io.to(`user:${targetUserId}`).emit('webrtc:answer', { roomId, answer, from: userId });
    });

    socket.on('webrtc:ice-candidate', ({ roomId, candidate, targetUserId }) => {
      io.to(`user:${targetUserId}`).emit('webrtc:ice-candidate', { roomId, candidate, from: userId });
    });

    socket.on('webrtc:join-room', ({ roomId }) => {
      socket.join(`room:${roomId}`);
      socket.to(`room:${roomId}`).emit('webrtc:user-joined', { userId, name: socket.user.name });
    });

    socket.on('webrtc:leave-room', ({ roomId }) => {
      socket.leave(`room:${roomId}`);
      socket.to(`room:${roomId}`).emit('webrtc:user-left', { userId });
    });

    socket.on('interview:alert', ({ targetUserId, interviewId, message }) => {
      io.to(`user:${targetUserId}`).emit('interview:alert', { interviewId, message });
    });

    socket.on('disconnect', async () => {
      onlineUsers.delete(userId);
      await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
      io.emit('user:online', { userId, isOnline: false });
      logger.debug(`User disconnected: ${userId}`);
    });
  });
};

export const getOnlineUsers = () => onlineUsers;
