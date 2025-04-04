// utils/logEvent.js
import RequestLog from '../models/RequestLog';
import connection from '../database';

async function logEvent({ uraRequestId, source, action, payload, statusCode, error }) {
  try {
    await RequestLog.create({
      uraRequestId,
      source,
      action,
      payloadSnapshot: payload || null,
      statusCode: statusCode || null,
      error: error || null,
      timestamp: new Date()
    }, { connection });
  } catch (e) {
    console.error('[logEvent] Failed to register log:', e.message);
  }
}

export default logEvent;
