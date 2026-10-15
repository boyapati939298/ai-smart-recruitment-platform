import Message from '../models/Message.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getConversations = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const messages = await Message.aggregate([
    {
      $match: {
        $or: [{ senderId: userId }, { receiverId: userId }],
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: {
          $cond: [
            { $eq: ['$senderId', userId] },
            '$receiverId',
            '$senderId',
          ],
        },
        lastMessage: { $first: '$$ROOT' },
        unreadCount: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ['$receiverId', userId] }, { $eq: ['$isRead', false] }] },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  const userIds = messages.map((m) => m._id);
  const users = await User.find({ _id: { $in: userIds } }).select('name email profileImage isOnline');

  const conversations = messages.map((m) => ({
    user: users.find((u) => u._id.toString() === m._id.toString()),
    lastMessage: m.lastMessage,
    unreadCount: m.unreadCount,
  }));

  res.json({ success: true, data: conversations });
});

export const getMessages = asyncHandler(async (req, res) => {
  const { userId: otherUserId } = req.params;

  const messages = await Message.find({
    $or: [
      { senderId: req.user._id, receiverId: otherUserId },
      { senderId: otherUserId, receiverId: req.user._id },
    ],
  })
    .sort('createdAt')
    .limit(100);

  await Message.updateMany(
    { senderId: otherUserId, receiverId: req.user._id, isRead: false },
    { isRead: true }
  );

  res.json({ success: true, data: messages });
});

export const sendMessage = asyncHandler(async (req, res) => {
  const { receiverId, content, jobId } = req.body;
  if (!content?.trim()) throw new ApiError(400, 'Message content required');

  const message = await Message.create({
    senderId: req.user._id,
    receiverId,
    content: content.trim(),
    jobId,
  });

  res.status(201).json({ success: true, data: message });
});
