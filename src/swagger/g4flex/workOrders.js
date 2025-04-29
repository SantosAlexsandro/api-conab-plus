/**
 * @swagger
 * components:
 *  schemas:
 *    WorkOrderResponse:
 *      type: object
 *      properties:
 *        customerHasOpenOrders:
 *          type: boolean
 *          description: Indica se o cliente possui ordens de serviço abertas
 *        orders:
 *          type: array
 *          items:
 *            type: object
 *            properties:
 *              number:
 *                type: string
 *                description: Número da ordem de serviço
 *              registrationDate:
 *                type: string
 *                format: date-time
 *                description: Data de registro da ordem de serviço
 *    WorkOrderCreateRequest:
 *      type: object
 *      required:
 *        - productId
 *        - requesterNameAndPosition
 *        - IncidentAndReceiverName
 *        - requesterWhatsApp
 *      properties:
 *        productId:
 *          type: string
 *          description: Código de identificação do produto
 *        requesterNameAndPosition:
 *          type: string
 *          description: Nome e cargo/função do solicitante
 *        IncidentAndReceiverName:
 *          type: string
 *          description: Descrição do incidente e nome da pessoa responsável que estará no local
 *        requesterWhatsApp:
 *          type: string
 *          description: Número do WhatsApp do solicitante
 *    WorkOrderCreateResponse:
 *      type: object
 *      properties:
 *        success:
 *          type: boolean
 *          description: Indica se a solicitação foi processada com sucesso
 *        message:
 *          type: string
 *          description: Mensagem descritiva do resultado da operação
 *    WorkOrderCloseResponse:
 *      type: object
 *      properties:
 *        success:
 *          type: boolean
 *          description: Indica se a ordem de serviço foi fechada com sucesso
 *        message:
 *          type: string
 *          description: Mensagem de sucesso
 *        orders:
 *          type: array
 *          items:
 *            type: string
 *          description: Lista de números das ordens de serviço fechadas
 *    WorkOrderCloseRequest:
 *      type: object
 *      required:
 *        - requesterName
 *        - requesterPosition
 *        - cancellationReason
 *      properties:
 *        requesterName:
 *          type: string
 *          description: Nome do solicitante
 *        requesterPosition:
 *          type: string
 *          description: Cargo/função do solicitante
 *        cancellationReason:
 *          type: string
 *          description: Motivo do cancelamento
 *  parameters:
 *    customerIdentifierParam:
 *      in: query
 *      name: customerIdentifier
 *      required: true
 *      schema:
 *        type: string
 *      description: Identificador do cliente (pode ser CPF, CNPJ ou ID do cliente da Conab)
 *    uraRequestIdParam:
 *      in: query
 *      name: uraRequestId
 *      required: true
 *      schema:
 *        type: string
 *      description: ID da requisição da URA (obrigatório)
 */

/**
 * @swagger
 * /api/integrations/g4flex/work-orders/open:
 *  get:
 *    tags:
 *      - G4Flex - Ordens de Serviço
 *    x-public: true
 *    summary: Lista ordens de serviço abertas do cliente
 *    description: Recupera da Conab+ as ordens de serviço abertas do cliente baseado no CPF, CNPJ ou ID do cliente
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - $ref: '#/components/parameters/customerIdentifierParam'
 *      - $ref: '#/components/parameters/uraRequestIdParam'
 *    responses:
 *      '200':
 *        description: Lista de ordens de serviço abertas do cliente
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/WorkOrderResponse'
 *      '400':
 *        description: Erro de validação dos parâmetros
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 *      '401':
 *        description: Não autenticado ou token inválido
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Token inválido para acesso à API G4Flex."
 *      '404':
 *        description: Cliente não encontrado
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 *      '500':
 *        description: Erro interno do servidor
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 *
 * /api/integrations/g4flex/work-orders/requests:
 *  post:
 *    tags:
 *      - G4Flex - Ordens de Serviço
 *    summary: Solicita uma nova ordem de serviço
 *    description: Solicita uma nova ordem de serviço na Conab+ para o cliente especificado
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - $ref: '#/components/parameters/customerIdentifierParam'
 *      - $ref: '#/components/parameters/uraRequestIdParam'
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/WorkOrderCreateRequest'
 *    responses:
 *      '200':
 *        description: Solicitação de criação de Ordem de Serviço realizada com sucesso.
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/WorkOrderCreateResponse'
 *      '400':
 *        description: Erro de validação dos parâmetros ou campos obrigatórios ausentes
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 *      '401':
 *        description: Não autenticado ou token inválido
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Token inválido para acesso à API G4Flex."
 *      '404':
 *        description: Cliente não encontrado
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 *      '500':
 *        description: Erro interno do servidor
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 *
 * /api/integrations/g4flex/work-orders/close:
 *  post:
 *    tags:
 *      - G4Flex - Ordens de Serviço
 *    summary: Fecha uma ordem de serviço
 *    description: Fecha uma ordem de serviço na Conab+ para o cliente especificado
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - $ref: '#/components/parameters/customerIdentifierParam'
 *      - $ref: '#/components/parameters/uraRequestIdParam'
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/WorkOrderCloseRequest'
 *    responses:
 *      '200':
 *        description: Ordem de serviço fechada com sucesso
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/WorkOrderCloseResponse'
 *      '400':
 *        description: Erro de validação dos parâmetros ou campos obrigatórios ausentes
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 *      '401':
 *        description: Não autenticado ou token inválido
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Token inválido para acesso à API G4Flex."
 *      '404':
 *        description: Cliente ou ordem de serviço não encontrada
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 *      '500':
 *        description: Erro interno do servidor
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 */

export const workOrderPaths = {};
