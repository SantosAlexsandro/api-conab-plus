import { generateG4FlexToken } from '../services/TokenService';

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

    const token = generateG4FlexToken(clientId);

    return res.status(200).json({
      success: true,
      token,
      expiresIn: process.env.G4FLEX_TOKEN_EXPIRATION,
    });
  }
}

export default new G4FlexTokenController();
