// src/integrations/g4flex/services/WhatsAppService.js
// Serviço para envio de mensagens WhatsApp via G4Flex
// Tipos de feedback disponíveis:
// - work_order_created: Quando uma ordem de serviço é criada
// - technician_assigned: Quando um técnico é atribuído à ordem
// - existing_order_found: Quando cliente consulta e já possui ordem aberta
// - order_cancelled: Quando uma ordem de serviço é cancelada

import axios from 'axios';
import logEvent from '../../../utils/logEvent';
import WorkOrderWaitingQueueService from '../../../services/WorkOrderWaitingQueueService';
import { normalizeName } from '../../../utils/string/formatUtils';
import EmployeeERPService from '../../../integrations/erp/services/EmployeeERPService';
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
    this.devPhoneNumber = '11945305889'; // Número para ambiente de desenvolvimento
    this.ERP_EMPLOYEE_SERVICE = new EmployeeERPService();
  }

  async sendWhatsAppMessage({ phoneNumber = '', workOrderId = '', customerName = '', feedback = '', technicianName = '', uraRequestId = '' }) {

    //if (this.isDevelopment) return

    console.log('INIT sendWhatsAppMessage', { phoneNumber, workOrderId, customerName, feedback, technicianName, uraRequestId });
    try {
      // Usar o número de desenvolvimento em ambiente de desenvolvimento
      const finalPhoneNumber = this.isDevelopment ? this.devPhoneNumber : phoneNumber;

       // Se não tiver customerName, busca da fila de espera
    if (customerName === '' && uraRequestId) {
      const queueData = await WorkOrderWaitingQueueService.findByUraRequestId(uraRequestId);
      if (queueData) {
        customerName = queueData.entityName;
          console.log(`📋 CustomerName obtido da fila de espera: ${customerName}`);
        }
      }

      let response = null;

      if (feedback === 'work_order_created') {
        response = await this.axiosInstance.post('/api/enviar-mensagem/texto', {
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
      }

      if (feedback === 'technician_assigned') {

        if (!technicianName || customerName === '' || !workOrderId) {
          console.log('Não foi possível enviar feedback de atribuição de técnico, pois os dados necessários não foram encontrados');
          return;
        }
        const employeeData = await this.ERP_EMPLOYEE_SERVICE.getEmployeeByUserCode(technicianName);
        if (!employeeData?.length ) {
          console.log(`Não foi possível obter dados do funcionário para o técnico ${technicianName}`);
          return;
        }

        response = await this.axiosInstance.post('/api/enviar-mensagem/texto', {
          clientPhone: finalPhoneNumber,
          clientName: customerName,
          canalWhatsapp: '1137323888',
          queueId: 53,
          templateId: '6dd02905-a664-4799-969c-4455918ebad9',
          params: [
            normalizeName(technicianName),
            employeeData[0]?.Codigo,
            workOrderId
          ]
        });
      }

      if (feedback === 'existing_order_found') {
        if (!customerName || customerName === '' || !workOrderId) {
          console.log('Não foi possível enviar feedback de ordem existente, pois os dados necessários não foram encontrados');
          return;
        }

        response = await this.axiosInstance.post('/api/enviar-mensagem/texto', {
          clientPhone: finalPhoneNumber,
          clientName: customerName,
          canalWhatsapp: '1137323888',
          queueId: 53,
          templateId: 'b3c53e7e-fdbe-4eef-8068-bce6486f92bd',
          params: [
          ]
        });
      }

      if (feedback === 'order_cancelled') {
        if (!customerName || customerName === '' || !workOrderId) {
          console.log('Não foi possível enviar feedback de cancelamento, pois os dados necessários não foram encontrados');
          return;
        }

        response = await this.axiosInstance.post('/api/enviar-mensagem/texto', {
          clientPhone: finalPhoneNumber,
          clientName: customerName,
          canalWhatsapp: '1137323888',
          queueId: 53,
          templateId: 'd638c087-b231-4e5a-b3bb-9c09dea4ee6b',
          params: [
            workOrderId
          ]
        });
      }

      // Logar a mensagem enviada
      logEvent({
        uraRequestId,
        source: 'system',
        action: 'send_whatsapp_message',
        payload: {
          phoneNumber: finalPhoneNumber,
          workOrderId,
          customerName,
          feedback,
          technicianName,
          uraRequestId,
          environment: this.isDevelopment ? 'development' : 'production'
        },
        response: response?.data,
        statusCode: response?.status,
        error: response?.data?.error
      });

      return response.data;
    } catch (error) {
      logEvent({
        uraRequestId,
        source: 'system',
        action: 'send_whatsapp_message_error',
        payload: {
          phoneNumber: phoneNumber,
          workOrderId: workOrderId,
          customerName: customerName,
          feedback: feedback,
          technicianName: technicianName,
          uraRequestId: uraRequestId
        },
        response: {
          error: error.message,
          apiError: error.response?.data?.error || null,
          requestData: error.config?.data ? JSON.parse(error.config.data) : null
        },
        statusCode: error.response?.status || 500,
        error: error.message
      });

      console.error('[WhatsAppService] Error sending WhatsApp message:', error);
      throw new Error(`Failed to send WhatsApp message: ${error.response?.data?.error || error.message}`);
    }
  }
}

export default new WhatsAppService();
