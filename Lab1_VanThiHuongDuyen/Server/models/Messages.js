import mongoose from 'mongoose';

export const messageSchema = new mongoose.Schema({
  message: String,
  isSentByMe: Boolean,
  username: String,
});

const Messages = mongoose.model('Messages', messageSchema);

export default Messages;
