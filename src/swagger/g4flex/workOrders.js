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
 *        - requesterName
 *        - requesterPosition
 *        - incidentDescription
 *        - siteContactPerson
 *        - productId
 *      properties:
 *        requesterWhatsApp:
 *          type: string
 *          description: Número do WhatsApp do cliente
 *        productId:
 *          type: string
 *          description: Código de identificação do produto
 *        requesterName:
 *          type: string
 *          description: Nome do solicitante
 *        requesterPosition:
 *          type: string
 *          description: Cargo/função do solicitante
 *        incidentDescription:
 *          type: string
 *          description: Descrição do problema relatado
 *        siteContactPerson:
 *          type: string
 *          description: Responsável que estará no local (zelador/acompanhante)
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
 * /g4flex/work-orders/check-open:
 *  get:
 *    tags:
 *      - Ordens de Serviço - Integração da URA G4Flex com a Conab+
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
 *      - Ordens de Serviço - Integração da URA G4Flex com a Conab+
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
 * /g4flex/work-orders/close:
 *  post:
 *    tags:
 *      - Ordens de Serviço - Integração da URA G4Flex com a Conab+
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
