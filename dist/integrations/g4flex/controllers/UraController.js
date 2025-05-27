"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _workOrderWaitingQueue = require('../../../models/workOrderWaitingQueue'); var _workOrderWaitingQueue2 = _interopRequireDefault(_workOrderWaitingQueue);
var _uraValidator = require('../utils/uraValidator');
var _resolveNumericIdentifier = require('../utils/resolveNumericIdentifier');
var _logEvent = require('../../../utils/logEvent'); var _logEvent2 = _interopRequireDefault(_logEvent);

class UraController {
  // Registra falha geral da URA
  async handleFailures(req, res) {
    // Pega uraRequestId dos query params e customerIdentifier do payload (body)
    let { uraRequestId = "" } = req.query;
    let { customerIdentifier = "" } = req.body;

    // Em ambiente de desenvolvimento, gerar automaticamente uraRequestId se não fornecido
    if (!uraRequestId && process.env.NODE_ENV === 'development') {
      uraRequestId = `dev-${Math.floor(Math.random() * 1000000)}`;
      console.log(`[DESENVOLVIMENTO] Gerado ID URA aleatório: ${uraRequestId}`);
    }

    try {
      // Usa validação específica para falhas da URA (customerIdentifier opcional)
      const validationError = _uraValidator.validateURAFailureQuery.call(void 0, { customerIdentifier, uraRequestId });
      if (validationError) {
        await _logEvent2.default.call(void 0, {
          uraRequestId,
          source: 'g4flex',
          action: 'ura_failure_validation_error',
          payload: { customerIdentifier, uraRequestId, ...req.body },
          response: { error: validationError },
          statusCode: 400,
          error: validationError,
        });
        return res.status(400).json({ error: validationError });
      }

      // Validação de campo obrigatório: requesterContact
      const { requesterContact } = req.body;
      if (!requesterContact) {
        const errorMsg = 'Missing required field: requesterContact';
        await _logEvent2.default.call(void 0, {
          uraRequestId,
          source: 'g4flex',
          action: 'ura_failure_validation_error',
          payload: { customerIdentifier, uraRequestId, ...req.body },
          response: { error: errorMsg },
          statusCode: 400,
          error: errorMsg,
        });
        return res.status(400).json({ error: errorMsg });
      }

      // Resolve o identificador apenas se customerIdentifier foi fornecido
      let identifierType = null;
      let identifierValue = null;

      if (customerIdentifier) {
        const resolved = _resolveNumericIdentifier.resolveNumericIdentifier.call(void 0, customerIdentifier);
        identifierType = resolved.identifierType;
        identifierValue = resolved.identifierValue;
      }

      // Verifica se já existe uma solicitação com este uraRequestId
      const existingRequest = await _workOrderWaitingQueue2.default.findOne({
        where: { uraRequestId }
      });

      if (existingRequest) {
        await _logEvent2.default.call(void 0, {
          uraRequestId,
          source: 'g4flex',
          action: 'ura_failure_duplicate_request',
          payload: { customerIdentifier, uraRequestId, ...req.body },
          response: { error: 'Request already exists' },
          statusCode: 409,
          error: 'Duplicate request'
        });
        return res.status(409).json({ error: 'A request with this ID already exists' });
      }

      // Cria novo registro na fila com status URA_FAILURE
      const newRequest = await _workOrderWaitingQueue2.default.create({
        customerIdentifier: identifierValue, // Pode ser null se não fornecido
        uraRequestId,
        status: 'URA_FAILURE',
        source: 'g4flex',
        productId: req.body.productId,
        requesterNameAndPosition: req.body.requesterNameAndPosition,
        incidentAndReceiverName: req.body.incidentAndReceiverName,
        requesterContact: req.body.requesterContact,
        cancellationRequesterInfo: req.body.cancellationRequesterInfo,
        failureReason: req.body.failureReason,
        priority: 'high' // Falhas da URA são tratadas com prioridade alta
      });

      await _logEvent2.default.call(void 0, {
        uraRequestId,
        source: 'g4flex',
        action: 'ura_failure_registered',
        payload: { customerIdentifier, uraRequestId, ...req.body },
        response: { queueId: newRequest.id },
        statusCode: 201
      });

      return res.status(201).json({
        success: true,
        message: 'URA failure registered successfully',
        request: newRequest
      });

    } catch (error) {
      await _logEvent2.default.call(void 0, {
        uraRequestId,
        source: 'g4flex',
        action: 'ura_failure_error',
        payload: { customerIdentifier, uraRequestId, ...req.body },
        response: { error: error.message },
        statusCode: 500,
        error: error.message
      });

      console.error('Error registering URA failure:', error);
      return res.status(500).json({
        error: error.message || 'Error registering URA failure'
      });
    }
  }
}

exports. default = new UraController();
