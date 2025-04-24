/**
 * @swagger
 * components:
 *  schemas:
 *    User:
 *      type: object
 *      required:
 *        - name
 *        - email
 *        - password
 *      properties:
 *        id:
 *          type: integer
 *          description: ID do usuário
 *        name:
 *          type: string
 *          description: Nome completo do usuário
 *        email:
 *          type: string
 *          format: email
 *          description: Email do usuário
 *        phone:
 *          type: string
 *          description: Telefone do usuário
 *        document:
 *          type: string
 *          description: CPF ou CNPJ do usuário
 *        status:
 *          type: string
 *          enum: [active, inactive, blocked]
 *          description: Status do usuário
 *        createdAt:
 *          type: string
 *          format: date-time
 *          description: Data de criação do usuário
 *    Product:
 *      type: object
 *      required:
 *        - name
 *        - code
 *        - price
 *      properties:
 *        id:
 *          type: integer
 *          description: ID do produto
 *        name:
 *          type: string
 *          description: Nome do produto
 *        code:
 *          type: string
 *          description: Código do produto
 *        description:
 *          type: string
 *          description: Descrição do produto
 *        price:
 *          type: number
 *          format: float
 *          description: Preço do produto
 *        category:
 *          type: string
 *          description: Categoria do produto
 *        stock:
 *          type: integer
 *          description: Quantidade em estoque
 *    Order:
 *      type: object
 *      properties:
 *        id:
 *          type: integer
 *          description: ID do pedido
 *        userId:
 *          type: integer
 *          description: ID do usuário que fez o pedido
 *        status:
 *          type: string
 *          enum: [pending, processing, completed, cancelled]
 *          description: Status do pedido
 *        totalValue:
 *          type: number
 *          format: float
 *          description: Valor total do pedido
 *        items:
 *          type: array
 *          items:
 *            type: object
 *            properties:
 *              productId:
 *                type: integer
 *                description: ID do produto
 *              quantity:
 *                type: integer
 *                description: Quantidade
 *              price:
 *                type: number
 *                format: float
 *                description: Preço unitário
 *        createdAt:
 *          type: string
 *          format: date-time
 *          description: Data de criação do pedido
 *    Error:
 *      type: object
 *      properties:
 *        error:
 *          type: string
 *          description: Mensagem de erro
 *    AuthResponse:
 *      type: object
 *      properties:
 *        token:
 *          type: string
 *          description: Token JWT para autenticação
 *        user:
 *          $ref: '#/components/schemas/User'
 */

/**
 * @swagger
 * /auth/login:
 *  post:
 *    tags:
 *      - ERP - Usuários
 *    x-public: true
 *    summary: Login de usuário
 *    description: Autentica um usuário e retorna um token JWT
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - email
 *              - password
 *            properties:
 *              email:
 *                type: string
 *                format: email
 *              password:
 *                type: string
 *                format: password
 *    responses:
 *      '200':
 *        description: Login realizado com sucesso
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/AuthResponse'
 *      '400':
 *        description: Dados inválidos
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 *      '401':
 *        description: Credenciais inválidas
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 *
 * /users:
 *  get:
 *    tags:
 *      - ERP - Usuários
 *    summary: Lista todos os usuários
 *    description: Retorna uma lista paginada de todos os usuários
 *    parameters:
 *      - in: query
 *        name: page
 *        schema:
 *          type: integer
 *          default: 1
 *        description: Número da página
 *      - in: query
 *        name: limit
 *        schema:
 *          type: integer
 *          default: 20
 *        description: Número de itens por página
 *      - in: query
 *        name: status
 *        schema:
 *          type: string
 *          enum: [active, inactive, blocked]
 *        description: Filtrar por status
 *    responses:
 *      '200':
 *        description: Lista de usuários
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                data:
 *                  type: array
 *                  items:
 *                    $ref: '#/components/schemas/User'
 *                total:
 *                  type: integer
 *                page:
 *                  type: integer
 *                pages:
 *                  type: integer
 *
 * /products:
 *  get:
 *    tags:
 *      - ERP - Produtos
 *    summary: Lista todos os produtos
 *    description: Retorna uma lista paginada de todos os produtos
 *    parameters:
 *      - in: query
 *        name: page
 *        schema:
 *          type: integer
 *          default: 1
 *        description: Número da página
 *      - in: query
 *        name: limit
 *        schema:
 *          type: integer
 *          default: 20
 *        description: Número de itens por página
 *      - in: query
 *        name: category
 *        schema:
 *          type: string
 *        description: Filtrar por categoria
 *    responses:
 *      '200':
 *        description: Lista de produtos
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                data:
 *                  type: array
 *                  items:
 *                    $ref: '#/components/schemas/Product'
 *                total:
 *                  type: integer
 *                page:
 *                  type: integer
 *                pages:
 *                  type: integer
 *
 * /orders:
 *  post:
 *    tags:
 *      - ERP - Pedidos
 *    summary: Cria um novo pedido
 *    description: Cria um novo pedido com os produtos especificados
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - items
 *            properties:
 *              items:
 *                type: array
 *                items:
 *                  type: object
 *                  required:
 *                    - productId
 *                    - quantity
 *                  properties:
 *                    productId:
 *                      type: integer
 *                    quantity:
 *                      type: integer
 *              notes:
 *                type: string
 *                description: Observações sobre o pedido
 *    responses:
 *      '201':
 *        description: Pedido criado com sucesso
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Order'
 *      '400':
 *        description: Dados inválidos
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 *      '404':
 *        description: Produto não encontrado
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 */

export const erpPaths = {};
