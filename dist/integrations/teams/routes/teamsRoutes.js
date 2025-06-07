"use strict";/*
 * ARQUIVO COMENTADO - ROTAS NÃO NECESSÁRIAS PARA USO INTERNO
 *
 * Este arquivo contém as rotas HTTP para a integração com Teams.
 * Como estamos usando apenas internamente (chamadas diretas aos services),
 * estas rotas não são necessárias.
 *
 * Para reativar: descomente o código abaixo e importe no app.js
 */

/*
import express from 'express';
import TeamsController from '../controllers/TeamsController';

const router = express.Router();

// Rotas de Autenticação
router.post('/auth/initiate', TeamsController.initiateAuth);
router.get('/auth/callback', TeamsController.authCallback);
router.get('/auth/status/:userId', TeamsController.checkAuth);
router.delete('/auth/logout/:userId', TeamsController.logout);
router.get('/auth/user-info/:userId', TeamsController.getUserInfo);

// Rotas de Chat e Mensagens
router.post('/chat/send-message', TeamsController.sendMessage);
router.post('/chat/create', TeamsController.createChat);
router.get('/chat/list/:userId', TeamsController.getUserChats);
router.get('/chat/:userId/:chatId/messages', TeamsController.getChatMessages);
router.post('/chat/send-attachment', TeamsController.sendMessageWithAttachment);

// Rotas de Notificações
router.post('/notification/send', TeamsController.sendNotification);

// Rotas de Usuários
router.get('/users/search/:userId', TeamsController.searchUsers);

// Rotas de Presença
router.get('/presence/:userId', TeamsController.getUserPresence);
router.post('/presence/set', TeamsController.setUserPresence);

export default router;
*/
