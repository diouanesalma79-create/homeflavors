import api from './api';

const assistantService = {
  async sendMessage(message) {
    const response = await api.post('/assistant/message', { message });
    return response.data.data;
  }
};

export default assistantService;
