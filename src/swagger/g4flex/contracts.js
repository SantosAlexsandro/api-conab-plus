/**
 * @swagger
 * components:
 *  schemas:
 *    ContractResponse:
 *      type: object
 *      properties:
 *        hasActiveContract:
 *          type: boolean
 *          description: Indica se o cliente possui contratos ativos
 *        customerInfo:
 *          type: object
 *          properties:
 *            id:
 *              type: string
 *              description: ID do cliente no G4Flex
 *            name:
 *              type: string
 *              description: Nome do cliente
 *            document:
 *              type: string
 *              description: Documento do cliente (CPF/CNPJ)
 *        contracts:
 *          type: array
 *          items:
 *            type: object
 *            properties:
 *              id:
 *                type: string
 *                description: ID do contrato
 *              status:
 *                type: string
 *                description: Status do contrato
 *              startDate:
 *                type: string
 *                format: date
 *                description: Data de início do contrato
 *              endDate:
 *                type: string
 *                format: date
 *                description: Data de término do contrato
 *    Error:
 *      type: object
 *      properties:
 *        error:
 *          type: string
 *          description: Mensagem de erro
 *  parameters:
 *    cpfParam:
 *      in: query
 *      name: cpf
 *      schema:
 *        type: string
 *      description: CPF do cliente (11 dígitos)
 *    cnpjParam:
 *      in: query
 *      name: cnpj
 *      schema:
 *        type: string
 *      description: CNPJ do cliente (14 dígitos)
 *    customerIdParam:
 *      in: query
 *      name: customerId
 *      schema:
 *        type: string
 *      description: ID do cliente no G4Flex
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
 * /g4flex/contracts/check-active:
 *  get:
 *    tags:
 *      - G4Flex - Contratos
 *    summary: Verifica se o cliente possui contratos ativos
 *    description: Verifica no G4Flex se o cliente possui contratos ativos baseado no CPF, CNPJ ou ID do cliente
 *    parameters:
 *      - $ref: '#/components/parameters/cpfParam'
 *      - $ref: '#/components/parameters/cnpjParam'
 *      - $ref: '#/components/parameters/customerIdParam'
 *      - $ref: '#/components/parameters/uraRequestIdParam'
 *    responses:
 *      '200':
 *        description: Informações sobre os contratos ativos do cliente
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ContractResponse'
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
 */

export const contractPaths = {};
