import axios from 'axios';

class BaseERPService {
  constructor() {
    // Usar uma instância singleton do axios para evitar múltiplas sessões
    if (!BaseERPService.axiosInstance) {
      BaseERPService.axiosInstance = axios.create({
        baseURL: process.env.ERP_API_URL,
        timeout: 20000,
        headers: {
          "Riosoft-Token": process.env.ERP_TOKEN,
          Accept: "application/json, text/plain, */*",
        },
      });
    }

    this.axiosInstance = BaseERPService.axiosInstance;
    this.apiUrl = process.env.ERP_API_URL;
    this.token = process.env.ERP_TOKEN;
  }

  handleError(error) {
    if (error.response) {
      console.error('API Response Error:', error.response.data);
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('No API response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
  }
}

export default BaseERPService;
