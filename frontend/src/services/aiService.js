import apiClient from './api'

const aiService = {
  // Query AI for agricultural advice
  queryAI: async (query) => {
    try {
      const response = await apiClient.post('/ai/query', { query })
      return response.data?.data || response.data
    } catch (error) {
      console.error('AI Query error:', error)
      throw error
    }
  },

  // Get chat history
  getChatHistory: async () => {
    try {
      const response = await apiClient.get('/ai/history')
      return response.data?.data || response.data
    } catch (error) {
      console.error('Get chat history error:', error)
      throw error
    }
  },

  // Send message and get response (convenience method)
  sendMessage: async (message) => {
    return aiService.queryAI(message)
  }
}

export default aiService
