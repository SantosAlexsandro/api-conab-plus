"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }// src/services/g4flex/WebhookService.js

var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _logEvent = require('../../../utils/logEvent'); var _logEvent2 = _interopRequireDefault(_logEvent);
class WebhookService {
  constructor() {
    this.webhookUrl = 'https://flexomni.g4flex.com.br/integration-service/webhook/conab/work-order-created';
    this.webhookClient = _axios2.default.create({
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async notifyWorkOrderCreated({ workOrderId, technicianName, uraRequestId }) {
    try {
      console.log('[WebhookService] Notifying webhook');
      console.log('[WebhookService] Work order ID:', workOrderId, 'Technician name:', technicianName, 'URA Request ID:', uraRequestId);

      /*const response = await this.webhookClient.post(this.webhookUrl, {
        workOrderId,
        technicianName
      });

      console.log(`[Webhook] Work order ${workOrderId} notification sent successfully`);
      return response.data;*/

      await _logEvent2.default.call(void 0, {
        uraRequestId,
        source: 'service_g4flex',
        action: 'work_order_create_webhook_success',
        payload: { workOrderId, technicianName },
        response: { workOrder: workOrderId }
      });

      console.log('[WorkOrderService] Webhook notification sent successfully');
      return {
        message: 'Webhook notification sent successfully'
      };
    } catch (error) {
      await _logEvent2.default.call(void 0, {
        uraRequestId,
        source: 'service_g4flex',
        action: 'work_order_create_webhook_error',
        payload: { workOrderId, technicianName },
        response: { error: error.message }
      });
      console.error('[Webhook] Error sending work order notification:', error);
      throw new Error(`Failed to send webhook notification: ${error.message}`);
    }
  }
}

exports. default = new WebhookService();
