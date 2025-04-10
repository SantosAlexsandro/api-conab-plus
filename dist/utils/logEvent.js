"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }// utils/logEvent.js
var _RequestLog = require('../models/RequestLog'); var _RequestLog2 = _interopRequireDefault(_RequestLog);
var _database = require('../database'); var _database2 = _interopRequireDefault(_database);

async function logEvent({ id, uraRequestId, source, action, payload, response, statusCode, error }) {
  try {
    if (id) {
      // Atualiza um log existente
      await _RequestLog2.default.update({
        action,
        payloadSnapshot: payload || null,
        responseSnapshot: response || null,
        statusCode: statusCode || null,
        error: error || null,
        timestamp: new Date()
      }, {
        where: { id },
        connection: _database2.default
      });
      return id;
    } else {
      // Cria um novo log
      const log = await _RequestLog2.default.create({
        uraRequestId,
        source,
        action,
        payloadSnapshot: payload || null,
        responseSnapshot: response || null,
        statusCode: statusCode || null,
        error: error || null,
        timestamp: new Date()
      }, { connection: _database2.default });
      return log.id;
    }
  } catch (e) {
    console.error('[logEvent] Failed to register log:', e.message);
    throw e;
  }
}

exports. default = logEvent;
