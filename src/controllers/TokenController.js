import jwt from 'jsonwebtoken';
import UserSession from '../models/UserSession';
import bcrypt from 'bcryptjs';

class TokenController {
  async store(req, res) {
    const { username = '', password = '' } = req.body;

    if (!username || !password) {
      return res.status(401).json({
        errors: ['Credenciais inválidas'],
      });
    }

    const userSession = await UserSession.findOne({
      where: {
        userName: username
      }
    });

    if (!userSession) {
      return res.status(401).json({
        errors: ['Usuário não existe'],
      });
    }

    // Verificando a senha
    const passwordMatch = await bcrypt.compare(password, userSession.encryptedPassword);
    if (!passwordMatch) {
      return res.status(401).json({
        errors: ['Senha inválida'],
      });
    }

    const { id } = userSession;
    const token = jwt.sign(
      {
        id,
        userName: username,
        type: 'user'
      },
      process.env.JWT_TOKEN_SECRET,
      {
        expiresIn: process.env.TOKEN_EXPIRATION,
      }
    );

    return res.status(200).json({
      token,
      user: {
        nome: username,
        id,
        userName: username
      }
    });
  }

  async storeG4Flex(req, res) {
    const { apiKey, clientId } = req.body;

    if (!apiKey || !clientId) {
      return res.status(401).json({
        success: false,
        errors: ['Credenciais inválidas'],
      });
    }

    // Verificar se as credenciais do G4Flex são válidas
    const validApiKey = process.env.G4FLEX_API_KEY;
    const validClientId = process.env.G4FLEX_CLIENT_ID;

    if (apiKey !== validApiKey || clientId !== validClientId) {
      return res.status(401).json({
        success: false,
        errors: ['Credenciais inválidas para integração G4Flex'],
      });
    }

    // Gerar token JWT com tipo específico para G4Flex
    const token = jwt.sign(
      {
        clientId,
        type: 'integration',
        integration: 'g4flex',
      },
      process.env.JWT_TOKEN_SECRET,
      {
        expiresIn: process.env.G4FLEX_TOKEN_EXPIRATION,
      }
    );

    return res.status(200).json({
      success: true,
      token,
      expiresIn: process.env.G4FLEX_TOKEN_EXPIRATION,
    });
  }
}

export default new TokenController();
