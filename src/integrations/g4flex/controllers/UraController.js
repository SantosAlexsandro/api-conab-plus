import WorkOrderWaitingQueue from '../../../models/workOrderWaitingQueue';
import { validateURAFailureQuery } from '../utils/uraValidator';
import { resolveNumericIdentifier } from '../utils/resolveNumericIdentifier';
import logEvent from '../../../utils/logEvent';

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
      const validationError = validateURAFailureQuery({ customerIdentifier, uraRequestId });
      if (validationError) {
        await logEvent({
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
        await logEvent({
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
        const resolved = resolveNumericIdentifier(customerIdentifier);
        identifierType = resolved.identifierType;
        identifierValue = resolved.identifierValue;
      }

      // Verifica se já existe uma solicitação com este uraRequestId
      const existingRequest = await WorkOrderWaitingQueue.findOne({
        where: { uraRequestId }
      });

      if (existingRequest) {
        await logEvent({
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
      const newRequest = await WorkOrderWaitingQueue.create({
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

      await logEvent({
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
      await logEvent({
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

export default new UraController();
