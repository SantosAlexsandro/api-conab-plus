"use strict";Object.defineProperty(exports, "__esModule", {value: true});/**
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
 *        - requesterContact
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
 *        requesterContact:
 *          type: string
 *          description: Número de contato do solicitante (fixo ou celular/WhatsApp)
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
 *        - cancellationRequesterInfo
 *      properties:
 *        cancellationRequesterInfo:
 *          type: string
 *          description: Informações do solicitante e motivo do cancelamento
 *    WorkOrderFailureRequest:
 *      type: object
 *      required:
 *        - requesterContact
 *      properties:
 *        customerIdentifier:
 *          type: string
 *          description: Identificador do cliente (pode ser CPF, CNPJ ou ID do cliente da Conab) - opcional
 *        productId:
 *          type: string
 *          description: Código de identificação do produto (opcional)
 *        requesterNameAndPosition:
 *          type: string
 *          description: Nome e cargo/função do solicitante (opcional)
 *        incidentAndReceiverName:
 *          type: string
 *          description: Descrição do incidente e nome da pessoa responsável que estará no local (opcional)
 *        requesterContact:
 *          type: string
 *          description: Número de contato do solicitante (obrigatório)
 *        cancellationRequesterInfo:
 *          type: string
 *          description: Informações do solicitante e motivo do cancelamento (opcional)
 *        failureReason:
 *          type: string
 *          description: Motivo da falha da URA
 *    WorkOrderFailureResponse:
 *      type: object
 *      properties:
 *        success:
 *          type: boolean
 *          description: Indica se a falha foi registrada com sucesso
 *        message:
 *          type: string
 *          description: Mensagem descritiva do resultado da operação
 *        request:
 *          type: object
 *          description: Dados da solicitação registrada na fila
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
 *    x-public: true
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
 *        description: Work order creation request successfully submitted.
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
 *    x-public: true
 *    summary: Fecha todas as ordens de serviço abertas do cliente
 *    description: Fecha todas as ordens de serviço abertas na Conab+ para o cliente especificado, registrando o solicitante e motivo do cancelamento
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
 *        description: Ordens de serviço fechadas com sucesso
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
 *
 * /api/integrations/g4flex/work-orders/request-failures:
 *  post:
 *    tags:
 *      - G4Flex - Ordens de Serviço
 *    x-public: true
 *    summary: Registra falhas da URA
 *    description: Registra falhas ocorridas na URA durante o processamento de solicitações de ordens de serviço. O customerIdentifier é opcional e pode ser enviado no payload. Endpoint público sem necessidade de autenticação.
 *    parameters:
 *      - $ref: '#/components/parameters/uraRequestIdParam'
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/WorkOrderFailureRequest'
 *    responses:
 *      '201':
 *        description: URA failure registered successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/WorkOrderFailureResponse'
 *      '400':
 *        description: Erro de validação dos parâmetros
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 *      '409':
 *        description: Duplicate request
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

 const workOrderPaths = {}; exports.workOrderPaths = workOrderPaths;
