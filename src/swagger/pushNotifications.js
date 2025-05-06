/**
 * @swagger
 * tags:
 *   name: Notificações Push
 *   description: Gerenciamento de notificações push
 */

/**
 * @swagger
 * /notifications/vapid-public-key:
 *   get:
 *     summary: Retorna a chave pública VAPID
 *     tags: [Notificações Push]
 *     responses:
 *       200:
 *         description: Chave pública VAPID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 publicKey:
 *                   type: string
 *                   description: A chave pública VAPID
 */

/**
 * @swagger
 * /notifications/subscribe:
 *   post:
 *     summary: Registra uma nova assinatura para notificações push
 *     tags: [Notificações Push]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subscription
 *             properties:
 *               subscription:
 *                 type: object
 *                 required:
 *                   - endpoint
 *                   - keys
 *                 properties:
 *                   endpoint:
 *                     type: string
 *                     description: URL do endpoint de push
 *                   expirationTime:
 *                     type: string
 *                     nullable: true
 *                     description: Tempo de expiração da assinatura
 *                   keys:
 *                     type: object
 *                     required:
 *                       - p256dh
 *                       - auth
 *                     properties:
 *                       p256dh:
 *                         type: string
 *                         description: Chave pública do cliente
 *                       auth:
 *                         type: string
 *                         description: Token de autenticação
 *               userId:
 *                 type: integer
 *                 description: ID do usuário (opcional)
 *     responses:
 *       201:
 *         description: Assinatura registrada com sucesso
 *       400:
 *         description: Dados de assinatura inválidos
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /notifications/unsubscribe:
 *   post:
 *     summary: Cancela uma assinatura de notificações push
 *     tags: [Notificações Push]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - endpoint
 *             properties:
 *               endpoint:
 *                 type: string
 *                 description: URL do endpoint de push
 *     responses:
 *       200:
 *         description: Assinatura cancelada com sucesso
 *       400:
 *         description: Endpoint não fornecido
 *       404:
 *         description: Assinatura não encontrada
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /notifications/subscriptions:
 *   get:
 *     summary: Lista assinaturas de notificações push
 *     tags: [Notificações Push]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: Filtrar por ID do usuário (opcional)
 *     responses:
 *       200:
 *         description: Lista de assinaturas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   endpoint:
 *                     type: string
 *                   expirationTime:
 *                     type: string
 *                     nullable: true
 *                   user_id:
 *                     type: integer
 *                     nullable: true
 *                   active:
 *                     type: boolean
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   updated_at:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /notifications/send:
 *   post:
 *     summary: Envia notificações push para assinantes
 *     tags: [Notificações Push]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - body
 *             properties:
 *               title:
 *                 type: string
 *                 description: Título da notificação
 *               body:
 *                 type: string
 *                 description: Corpo da notificação
 *               icon:
 *                 type: string
 *                 description: URL do ícone da notificação (opcional)
 *               tag:
 *                 type: string
 *                 description: Tag para agrupar notificações (opcional)
 *               data:
 *                 type: object
 *                 description: Dados adicionais para a notificação (opcional)
 *               userId:
 *                 type: integer
 *                 description: ID do usuário específico (opcional)
 *               endpoint:
 *                 type: string
 *                 description: Endpoint específico (opcional)
 *     responses:
 *       200:
 *         description: Resultado do envio de notificações
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 results:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: integer
 *                     failed:
 *                       type: integer
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: object
 *       400:
 *         description: Parâmetros inválidos
 *       404:
 *         description: Nenhuma assinatura encontrada
 *       500:
 *         description: Erro interno do servidor
 */
