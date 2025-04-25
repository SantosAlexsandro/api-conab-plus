/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: Token JWT de autenticação
 *
 *   schemas:
 *     G4FlexAuthentication:
 *       type: object
 *       required:
 *         - apiKey
 *         - clientId
 *       properties:
 *         apiKey:
 *           type: string
 *           description: Chave de API fornecida para o G4Flex
 *         clientId:
 *           type: string
 *           description: ID do cliente G4Flex
 *       example:
 *         apiKey: "string"
 *         clientId: "string"
 *
 *     G4FlexAuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indica se a autenticação foi bem-sucedida
 *         token:
 *           type: string
 *           description: Token JWT para autenticação nas requisições subsequentes
 *         expiresIn:
 *           type: string
 *           description: Tempo de expiração do token
 *       example:
 *         success: true
 *         token: "eyJhbGciOi...EXEMPLO_PARCIAL"
 *         expiresIn: "24h"
 */

/**
 * @swagger
 * /api/integrations/g4flex/token:
 *   post:
 *     summary: Autenticação para G4Flex
 *     description: Gera um token JWT para autenticação do G4Flex nas APIs de integração
 *     tags: [G4Flex - Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/G4FlexAuthentication'
 *     responses:
 *       200:
 *         description: Token gerado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/G4FlexAuthResponse'
 *       401:
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Credenciais inválidas para integração G4Flex"]
 *     x-public: true
 */
