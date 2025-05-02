import ChatHistory from "../models/ChatHistory.js";
import User from "../models/User.js";

const ChatHistoryController = {
  async getHistory(req, res) {
    const { user_id, model_id } = req.params;
    const history = await ChatHistory.findAll({
      where: { user_id, model_id },
      order: [["createdAt", "ASC"]],
    });
    res.json(history);
  },

  async addMessage(req, res) {
    const { user_id, model_id } = req.params;
    const { message, sender } = req.body;

    const chat = await ChatHistory.create({ user_id, model_id, message, sender });
    res.status(201).json(chat);
  },
};

export default ChatHistoryController;
