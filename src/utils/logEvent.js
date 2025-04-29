// utils/logEvent.js
import RequestLog from '../models/RequestLog';
import connection from '../database';

async function logEvent({ uraRequestId, source, action, payload, response, statusCode, error }) {
  try {
    // Cria um novo log
    const log = await RequestLog.create({
      uraRequestId,
      source,
      action,
      payloadSnapshot: payload || null,
      responseSnapshot: response || null,
      statusCode: statusCode || null,
      error: error || null,
      timestamp: new Date()
    }, { connection });
    return log.id;
  } catch (e) {
    console.error('[logEvent] Failed to register log:', e.message);
    throw e;
  }
}

export default logEvent;
