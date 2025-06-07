"use strict";/*
 * ARQUIVO COMENTADO - MIDDLEWARES NÃO NECESSÁRIOS PARA USO INTERNO
 *
 * Este arquivo contém os middlewares de autenticação para rotas HTTP do Teams.
 * Como estamos usando apenas internamente (chamadas diretas aos services),
 * estes middlewares não são necessários.
 *
 * Para reativar: descomente o código abaixo e reative as rotas
 */

/*
import TeamsAuthService from '../services/TeamsAuthService';
import logEvent from '../../../utils/logEvent';

// Middleware para verificar se o usuário está autenticado no Teams
export const requireTeamsAuth = (req, res, next) => {
  try {
    const userId = req.params.userId || req.body.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        errors: ['UserId é obrigatório']
      });
    }

    if (!TeamsAuthService.isUserAuthenticated(userId)) {
      return res.status(401).json({
        success: false,
        errors: ['Usuário não autenticado no Teams. Realize login primeiro.'],
        authRequired: true
      });
    }

    req.teamsUserId = userId;
    next();
  } catch (error) {
    logEvent('error', 'TeamsAuthMiddleware', `Erro na validação de autenticação: ${error.message}`);
    return res.status(500).json({
      success: false,
      errors: ['Erro interno do servidor']
    });
  }
};

// Middleware para validar se o token ainda está válido
export const validateTeamsToken = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.body.userId || req.teamsUserId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        errors: ['UserId é obrigatório']
      });
    }

    const isValid = await TeamsAuthService.validateToken(userId);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        errors: ['Token do Teams inválido ou expirado. Necessário realizar nova autenticação.'],
        tokenExpired: true
      });
    }

    req.teamsUserId = userId;
    next();
  } catch (error) {
    logEvent('error', 'TeamsAuthMiddleware', `Erro na validação de token: ${error.message}`);
    return res.status(500).json({
      success: false,
      errors: ['Erro interno do servidor']
    });
  }
};

// Middleware opcional para autenticação (não bloqueia se não autenticado)
export const optionalTeamsAuth = (req, res, next) => {
  try {
    const userId = req.params.userId || req.body.userId;

    if (userId && TeamsAuthService.isUserAuthenticated(userId)) {
      req.teamsUserId = userId;
      req.isTeamsAuthenticated = true;
    } else {
      req.isTeamsAuthenticated = false;
    }

    next();
  } catch (error) {
    logEvent('error', 'TeamsAuthMiddleware', `Erro na validação opcional de autenticação: ${error.message}`);
    req.isTeamsAuthenticated = false;
    next();
  }
};
*/
