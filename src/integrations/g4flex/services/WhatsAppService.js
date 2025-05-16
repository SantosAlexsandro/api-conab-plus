// src/services/g4flex/WebhookService.js

import axios from 'axios';
import logEvent from '../../../utils/logEvent';
class WhatsAppService {
  constructor() {
    this.apiUrl = 'https://conab.g4flex.com.br:9090/integration-service';
    this.token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlVNeWN1NEd1VFF3VGVuUERwWGxIRjB4NE9HMnhiNDgxIn0.eyJpZCI6IjM0Yjc0MTczLWVlMTctNDRhYy05OGI5LTM5ODM1NDA1M2ZqNCIsInNjb3BlcyI6WyJmdWxsX2FjY2VzcyJdLCJ1c2VyIjoieEJ2bG94OWFTT2RaM2loekJ4TWxYVVMxaVlkaURoOWoiLCJsb2dpbiI6ImludGVncmF0aW9uLnNlcnZpY2UiLCJpYXQiOjE3NDcxNjY0NTQsImV4cCI6MTc0NzE3MDA1NCwiaXNzIjoiaHR0cHM6Ly93d3cuZzRmbGV4LmNvbS5iciIsInN1YiI6IjM0Yjc0MTczLWVlMTctNDRhYy05OGI5LTM5ODM1NDA1M2ZqNCJ9.V1G8dUkdk3hoj-0aG6cuL70wewk4eM0hG7mD8vwXVOc";
    this.axiosInstance = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      }
    });
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.devPhoneNumber = '5511945305889'; // Número para ambiente de desenvolvimento
  }

  async sendWhatsAppMessage({ phoneNumber, workOrderId, customerName, requesterContact }) {
    try {
      // Usar o número de desenvolvimento em ambiente de desenvolvimento
      const finalPhoneNumber = this.isDevelopment ? this.devPhoneNumber : phoneNumber;

      const response = await this.axiosInstance.post('/api/enviar-mensagem/texto', {
        clientPhone: finalPhoneNumber,
        clientName: customerName,
        canalWhatsapp: '1137323888',
        queueId: 53,
        templateId: 'b9319a07-1329-4d22-a6cc-7b3ace20ba50',
        params: [
          workOrderId,
          customerName
        ]
      });

      // Logar a mensagem enviada
      logEvent({
        source: 'g4flex',
        action: 'SEND_WHATSAPP_MESSAGE',
        type: 'WhatsApp Message Sent',
        payloadSnapshot: {
          phoneNumber: finalPhoneNumber,
          workOrderId,
          customerName,
          environment: this.isDevelopment ? 'development' : 'production'
        }
      });

      return response.data;
    } catch (error) {
      console.error('[WhatsAppService] Error sending WhatsApp message:', error);
      throw new Error(`Failed to send WhatsApp message: ${error.message}`);
    }
  }
}

export default new WhatsAppService();
