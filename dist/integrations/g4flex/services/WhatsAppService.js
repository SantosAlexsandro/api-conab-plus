"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }// src/integrations/g4flex/services/WhatsAppService.js
// Serviço para envio de mensagens WhatsApp via G4Flex
// Tipos de feedback disponíveis:
// - work_order_created: Quando uma ordem de serviço é criada
// - technician_assigned: Quando um técnico é atribuído à ordem
// - existing_order_found: Quando cliente consulta e já possui ordem aberta
// - order_cancelled: Quando uma ordem de serviço é cancelada

var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _logEvent = require('../../../utils/logEvent'); var _logEvent2 = _interopRequireDefault(_logEvent);
var _WorkOrderWaitingQueueService = require('../../../services/WorkOrderWaitingQueueService'); var _WorkOrderWaitingQueueService2 = _interopRequireDefault(_WorkOrderWaitingQueueService);
var _formatUtils = require('../../../utils/string/formatUtils');
var _EmployeeERPService = require('../../../integrations/erp/services/EmployeeERPService'); var _EmployeeERPService2 = _interopRequireDefault(_EmployeeERPService);

class WhatsAppService {
  constructor() {
    this.apiUrl = process.env.G4FLEX_API_URL;
    this.token = process.env.G4FLEX_TOKEN;
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

  async sendWhatsAppMessage({ phoneNumber = '', workOrderId = '', customerName = '', feedback = '', technicianName = '', uraRequestId = '' }) {

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
          templateId: '6dd02905-a664-4799-969c-4455918ebad9',
          params: [
            _formatUtils.normalizeName.call(void 0, technicianName),
            _optionalChain([employeeData, 'access', _2 => _2[0], 'optionalAccess', _3 => _3.Codigo]),
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
        response: _optionalChain([response, 'optionalAccess', _4 => _4.data]),
        statusCode: _optionalChain([response, 'optionalAccess', _5 => _5.status]),
        error: _optionalChain([response, 'optionalAccess', _6 => _6.data, 'optionalAccess', _7 => _7.error])
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
          apiError: _optionalChain([error, 'access', _8 => _8.response, 'optionalAccess', _9 => _9.data, 'optionalAccess', _10 => _10.error]) || null,
          requestData: _optionalChain([error, 'access', _11 => _11.config, 'optionalAccess', _12 => _12.data]) ? JSON.parse(error.config.data) : null
        },
        statusCode: _optionalChain([error, 'access', _13 => _13.response, 'optionalAccess', _14 => _14.status]) || 500,
        error: error.message
      });

      console.error('[WhatsAppService] Error sending WhatsApp message:', error);
      throw new Error(`Failed to send WhatsApp message: ${_optionalChain([error, 'access', _15 => _15.response, 'optionalAccess', _16 => _16.data, 'optionalAccess', _17 => _17.error]) || error.message}`);
    }
  }
}

exports. default = new WhatsAppService();
