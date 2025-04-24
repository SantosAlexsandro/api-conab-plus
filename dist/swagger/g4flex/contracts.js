"use strict";Object.defineProperty(exports, "__esModule", {value: true});/**
 * @swagger
 * components:
 *  schemas:
 *    ContractResponse:
 *      type: object
 *      properties:
 *        customerId:
 *          type: string
 *          description: ID do cliente na Conab+
 *        hasActiveContract:
 *          type: boolean
 *          description: Indica se o cliente possui contratos ativos
 *        customerName:
 *          type: string
 *          description: Nome do cliente
 *    Error:
 *      type: object
 *      properties:
 *        error:
 *          type: string
 *          description: Mensagem de erro
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
 * /g4flex/contracts/check-active:
 *  get:
 *    tags:
 *      - Contratos - Integração da URA G4Flex com a Conab+
 *      - Public
 *    summary: Verifica se o cliente possui contratos ativos
 *    description: Verifica na Conab+ se o cliente possui contratos ativos baseado no CPF, CNPJ ou ID do cliente
 *    parameters:
 *      - $ref: '#/components/parameters/customerIdentifierParam'
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

 const contractPaths = {}; exports.contractPaths = contractPaths;
