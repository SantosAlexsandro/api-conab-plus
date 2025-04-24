/**
 * @swagger
 * components:
 *  schemas:
 *    WorkOrderCheckResponse:
 *      type: object
 *      properties:
 *        customerHasOpenOrders:
 *          type: boolean
 *          description: Indica se o cliente possui ordens de serviço abertas
 *        quantityOrders:
 *          type: integer
 *          description: Quantidade de ordens de serviço abertas
 *          default: 1
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
 *    TokenRequest:
 *      type: object
 *      required:
 *        - email
 *        - password
 *      properties:
 *        email:
 *          type: string
 *          format: email
 *          description: Email do usuário
 *        password:
 *          type: string
 *          format: password
 *          description: Senha do usuário
 *    TokenResponse:
 *      type: object
 *      properties:
 *        token:
 *          type: string
 *          description: Token JWT gerado para autenticação
 *        user:
 *          type: object
 *          properties:
 *            nome:
 *              type: string
 *              description: Nome do usuário
 *            id:
 *              type: integer
 *              description: ID do usuário
 *            entity_email:
 *              type: string
 *              format: email
 *              description: Email do usuário
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
 * /tokens:
 *  post:
 *    tags:
 *      - G4Flex - Autenticação
 *    summary: Gera um token de autenticação
 *    description: Gera um token JWT para autenticação nas APIs da Conab+
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/TokenRequest'
 *    responses:
 *      '200':
 *        description: Token gerado com sucesso
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/TokenResponse'
 *      '401':
 *        description: Credenciais inválidas
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                errors:
 *                  type: array
 *                  items:
 *                    type: string
 *                  example: ['Credenciais inválidas', 'Usuário não existe', 'Senha inválida']
 *      '500':
 *        description: Erro interno do servidor
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 *
 * /g4flex/work-orders/check-open:
 *  get:
 *    tags:
 *      - G4Flex - Ordens de Serviço
 *    summary: Verifica se o cliente possui ordens de serviço abertas
 *    description: Verifica na Conab+ se o cliente possui ordens de serviço abertas baseado no CPF, CNPJ ou ID do cliente
 *    parameters:
 *      - $ref: '#/components/parameters/customerIdentifierParam'
 *      - $ref: '#/components/parameters/uraRequestIdParam'
 *    responses:
 *      '200':
 *        description: Informações sobre as ordens de serviço abertas do cliente
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/WorkOrderCheckResponse'
 *      '400':
 *        description: Erro de validação dos parâmetros
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
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
 * /g4flex/work-orders/requests:
 *  post:
 *    tags:
 *      - G4Flex - Ordens de Serviço
 *    summary: Solicita uma nova ordem de serviço
 *    description: Solicita uma nova ordem de serviço na Conab+ para o cliente especificado
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
 * /g4flex/work-orders/close:
 *  post:
 *    tags:
 *      - G4Flex - Ordens de Serviço
 *    summary: Fecha ordens de serviço abertas
 *    description: Fecha ordens de serviço abertas na Conab+ para o cliente especificado
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
 *        description: Ordens de serviço fechadas com sucesso
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/WorkOrderCloseResponse'
 *      '400':
 *        description: Erro de validação dos parâmetros
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 *      '404':
 *        description: Cliente não encontrado ou sem ordens de serviço abertas
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
