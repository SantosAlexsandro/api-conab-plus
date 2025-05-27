/**
 * @swagger
 * components:
 *  schemas:
 *    UraFailureRequest:
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
 *        flowType:
 *          type: string
 *          enum: [work-order, contract, inquiry]
 *          description: Tipo de fluxo onde ocorreu a falha
 *    UraFailureResponse:
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
 *    Error:
 *      type: object
 *      properties:
 *        error:
 *          type: string
 *          description: Mensagem de erro
 *  parameters:
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
 * /api/integrations/g4flex/ura/failures:
 *  post:
 *    tags:
 *      - G4Flex - URA
 *    x-public: true
 *    summary: Registra falhas gerais da URA
 *    description: Endpoint público para registrar falhas ocorridas na URA durante qualquer tipo de processamento (ordens de serviço, contratos, consultas, etc.). O customerIdentifier é opcional e pode ser enviado no payload. Este endpoint não requer autenticação.
 *    parameters:
 *      - $ref: '#/components/parameters/uraRequestIdParam'
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/UraFailureRequest'
 *    responses:
 *      '201':
 *        description: URA failure registered successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/UraFailureResponse'
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

export const uraPaths = {};
