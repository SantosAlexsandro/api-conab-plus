import axios from 'axios';

class BaseERPService {
  constructor() {
    this.apiUrl = process.env.ERP_API_URL;
    // Token do ERP (Riosoft) para autenticação nas APIs do sistema
    this.token = process.env.ERP_TOKEN;

    this.axiosInstance = axios.create({
      baseURL: this.apiUrl,
      timeout: 20000,
      headers: {
        "Riosoft-Token": this.token,
        Accept: "application/json, text/plain, */*",
      },
    });
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
