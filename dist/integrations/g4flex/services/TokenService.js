"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _jsonwebtoken = require('jsonwebtoken'); var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

 function generateG4FlexToken(clientId) {
  return _jsonwebtoken2.default.sign(
    {
      clientId,
      type: 'integration',
      integration: 'g4flex',
    },
    process.env.JWT_TOKEN_SECRET,
    { expiresIn: process.env.G4FLEX_TOKEN_EXPIRATION }
  );
} exports.generateG4FlexToken = generateG4FlexToken;
