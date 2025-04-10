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
 *        - customerId
 *        - uraRequestId
 *        - description
 *      properties:
 *        customerId:
 *          type: string
 *          description: ID do cliente no G4Flex
 *        uraRequestId:
 *          type: string
 *          description: ID da requisição da URA
 *        description:
 *          type: string
 *          description: Descrição da ordem de serviço
 *        type:
 *          type: string
 *          description: Tipo da ordem de serviço
 *    WorkOrderCreateResponse:
 *      type: object
 *      properties:
 *        success:
 *          type: boolean
 *          description: Indica se a ordem de serviço foi criada com sucesso
 *        workOrderId:
 *          type: string
 *          description: ID da ordem de serviço criada
 *        message:
 *          type: string
 *          description: Mensagem de sucesso
 *    WorkOrderCloseResponse:
 *      type: object
 *      properties:
 *        success:
 *          type: boolean
 *          description: Indica se a ordem de serviço foi fechada com sucesso
 *        workOrderId:
 *          type: string
 *          description: ID da ordem de serviço fechada
 *        message:
 *          type: string
 *          description: Mensagem de sucesso
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
 *      - $ref: '#/components/parameters/cpfParam'
 *      - $ref: '#/components/parameters/cnpjParam'
 *      - $ref: '#/components/parameters/customerIdParam'
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
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/WorkOrderCreateRequest'
 *    responses:
 *      '200':
 *        description: Ordem de serviço criada com sucesso
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
 *    summary: Fecha uma ordem de serviço aberta
 *    description: Fecha uma ordem de serviço aberta na Conab+ para o cliente especificado
 *    parameters:
 *      - $ref: '#/components/parameters/cpfParam'
 *      - $ref: '#/components/parameters/cnpjParam'
 *      - $ref: '#/components/parameters/customerIdParam'
 *      - $ref: '#/components/parameters/uraRequestIdParam'
 *    responses:
 *      '200':
 *        description: Ordem de serviço fechada com sucesso
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
