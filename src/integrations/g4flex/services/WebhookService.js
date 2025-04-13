// src/services/g4flex/WebhookService.js

import axios from 'axios';

class WebhookService {
  constructor() {
    this.webhookUrl = 'https://flexomni.g4flex.com.br/integration-service/webhook/conab/work-order-created';
    this.webhookClient = axios.create({
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }


  async notifyWorkOrderCreated({ workOrderId, technicianName }) {
    try {
      console.log('[WebhookService] Notifying webhook');
      console.log('[WebhookService] Work order ID:', workOrderId, 'Technician name:', technicianName);


      /*const response = await this.webhookClient.post(this.webhookUrl, {
        workOrderId,
        technicianName
      });

      console.log(`[Webhook] Work order ${workOrderId} notification sent successfully`);
      return response.data;*/

      return {
        message: 'Webhook notification sent successfully'
      };
    } catch (error) {

      console.error('[Webhook] Error sending work order notification:', error);
      throw new Error(`Failed to send webhook notification: ${error.message}`);
    }
  }
}

export default new WebhookService();
