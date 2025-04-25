"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _TokenService = require('../services/TokenService');

class G4FlexTokenController {
  async authenticate(req, res) {
    const { apiKey, clientId } = req.body;

    if (!apiKey || !clientId) {
      return res.status(401).json({
        success: false,
        errors: ['Credenciais inválidas'],
      });
    }

    // Verificar se as credenciais do G4Flex são válidas
    if (apiKey !== process.env.G4FLEX_API_KEY || clientId !== process.env.G4FLEX_CLIENT_ID) {
      return res.status(401).json({
        success: false,
        errors: ['Credenciais inválidas para integração G4Flex'],
      });
    }

    const token = _TokenService.generateG4FlexToken.call(void 0, clientId);

    return res.status(200).json({
      success: true,
      token,
      expiresIn: process.env.G4FLEX_TOKEN_EXPIRATION,
    });
  }
}

exports. default = new G4FlexTokenController();
