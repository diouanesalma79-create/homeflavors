import api from './api';

const messageService = {
    /**
     * Search all users (cook + customer) by name or email.
     * Safeguard #6: min 2 chars enforced on backend, limit 10.
     * @param {string} query - search term
     */
    async searchUsers(query) {
        const response = await api.get('/users/search', { params: { q: query } });
        return response.data.data;
    },

    /**
     * List all recent conversations for the current user.
     */
    async getConversations() {
        const response = await api.get('/conversations');
        return response.data.data;
    },

    /**
     * Get chat history with a specific user (last 50 messages, ASC).
     * @param {number} userId - the other user's ID
     */
    async getChatHistory(userId) {
        const response = await api.get(`/messages/${userId}`);
        return response.data.data;
    },

    /**
     * Send a new message.
     * @param {number} receiverId
     * @param {string} content
     */
    async sendMessage(receiverId, content) {
        const response = await api.post('/messages', {
            receiver_id: receiverId,
            content: content.trim(),
        });
        return response.data.data;
    }
};

export default messageService;
