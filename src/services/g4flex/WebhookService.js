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

  /**
   * Notify work order creation
   * @param {Object} params - Webhook parameters
   * @param {string} params.workOrderId - Work order ID
   * @param {string} params.technicianName - Name of the assigned technician
   * @returns {Promise<Object>} Webhook response
   */
  async notifyWorkOrderCreated({ workOrderId, technicianName }) {
    try {
      const response = await this.webhookClient.post(this.webhookUrl, {
        workOrderId,
        technicianName
      });

      console.log(`[Webhook] Work order ${workOrderId} notification sent successfully`);
      return response.data;
    } catch (error) {
      console.error('[Webhook] Error sending work order notification:', error);
      throw new Error(`Failed to send webhook notification: ${error.message}`);
    }
  }
}

export default new WebhookService();
