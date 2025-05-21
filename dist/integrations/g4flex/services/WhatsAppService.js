"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }// src/services/g4flex/WebhookService.js

var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _logEvent = require('../../../utils/logEvent'); var _logEvent2 = _interopRequireDefault(_logEvent);
var _WorkOrderWaitingQueueService = require('../../../services/WorkOrderWaitingQueueService'); var _WorkOrderWaitingQueueService2 = _interopRequireDefault(_WorkOrderWaitingQueueService);
var _formatUtils = require('../../../utils/string/formatUtils');
var _EmployeeERPService = require('../../../integrations/erp/services/EmployeeERPService'); var _EmployeeERPService2 = _interopRequireDefault(_EmployeeERPService);
class WhatsAppService {
  constructor() {
    this.apiUrl = 'https://conab.g4flex.com.br:9090/integration-service';
    this.token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlVNeWN1NEd1VFF3VGVuUERwWGxIRjB4NE9HMnhiNDgxIn0.eyJpZCI6IjM0Yjc0MTczLWVlMTctNDRhYy05OGI5LTM5ODM1NDA1M2ZqNCIsInNjb3BlcyI6WyJmdWxsX2FjY2VzcyJdLCJ1c2VyIjoieEJ2bG94OWFTT2RaM2loekJ4TWxYVVMxaVlkaURoOWoiLCJsb2dpbiI6ImludGVncmF0aW9uLnNlcnZpY2UiLCJpYXQiOjE3NDcxNjY0NTQsImV4cCI6MTc0NzE3MDA1NCwiaXNzIjoiaHR0cHM6Ly93d3cuZzRmbGV4LmNvbS5iciIsInN1YiI6IjM0Yjc0MTczLWVlMTctNDRhYy05OGI5LTM5ODM1NDA1M2ZqNCJ9.V1G8dUkdk3hoj-0aG6cuL70wewk4eM0hG7mD8vwXVOc";
    this.axiosInstance = _axios2.default.create({
      baseURL: this.apiUrl,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      }
    });
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.devPhoneNumber = '11945305889'; // Número para ambiente de desenvolvimento
    this.ERP_EMPLOYEE_SERVICE = new (0, _EmployeeERPService2.default)();
  }

  async sendWhatsAppMessage({ phoneNumber, workOrderId, customerName, feedback, technicianName, uraRequestId }) {

    if (this.isDevelopment) return

    console.log('INIT sendWhatsAppMessage', { phoneNumber, workOrderId, customerName, feedback, technicianName, uraRequestId });
    try {
      // Usar o número de desenvolvimento em ambiente de desenvolvimento
      const finalPhoneNumber = this.isDevelopment ? this.devPhoneNumber : phoneNumber;

       // Se não tiver customerName, busca da fila de espera
    if (customerName === '' && uraRequestId) {
      const queueData = await _WorkOrderWaitingQueueService2.default.findByUraRequestId(uraRequestId);
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
        if (!_optionalChain([employeeData, 'optionalAccess', _ => _.length]) ) {
          console.log(`Não foi possível obter dados do funcionário para o técnico ${technicianName}`);
          return;
        }

        response = await this.axiosInstance.post('/api/enviar-mensagem/texto', {
          clientPhone: finalPhoneNumber,
          clientName: customerName,
          canalWhatsapp: '1137323888',
          queueId: 53,
          templateId: '36d39190-4b6c-40ca-b4ce-f346b3f647be',
          params: [
            _formatUtils.normalizeName.call(void 0, technicianName),
            workOrderId
          ]
        });
      }

      // Logar a mensagem enviada
      _logEvent2.default.call(void 0, {
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
        response: _optionalChain([response, 'optionalAccess', _2 => _2.data]),
        statusCode: _optionalChain([response, 'optionalAccess', _3 => _3.status]),
        error: _optionalChain([response, 'optionalAccess', _4 => _4.data, 'optionalAccess', _5 => _5.error])
      });

      return response.data;
    } catch (error) {
      _logEvent2.default.call(void 0, {
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
          apiError: _optionalChain([error, 'access', _6 => _6.response, 'optionalAccess', _7 => _7.data, 'optionalAccess', _8 => _8.error]) || null,
          requestData: _optionalChain([error, 'access', _9 => _9.config, 'optionalAccess', _10 => _10.data]) ? JSON.parse(error.config.data) : null
        },
        statusCode: _optionalChain([error, 'access', _11 => _11.response, 'optionalAccess', _12 => _12.status]) || 500,
        error: _optionalChain([error, 'access', _13 => _13.response, 'optionalAccess', _14 => _14.data, 'optionalAccess', _15 => _15.error]) || error.message
      });

      console.error('[WhatsAppService] Error sending WhatsApp message:', error);
      throw new Error(`Failed to send WhatsApp message: ${_optionalChain([error, 'access', _16 => _16.response, 'optionalAccess', _17 => _17.data, 'optionalAccess', _18 => _18.error]) || error.message}`);
    }
  }
}

exports. default = new WhatsAppService();
