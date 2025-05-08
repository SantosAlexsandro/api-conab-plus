# API Conab+

## Swagger e Documentação da API

### Filtragem de Rotas para Produção

O Swagger está configurado para mostrar apenas endpoints específicos no ambiente de produção, utilizando a extensão `x-public`.

#### Marcando Rotas Públicas

Para indicar que uma rota deve estar disponível na documentação em ambiente de produção, adicione o atributo `x-public: true` na definição da rota:

```javascript
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [ERP - Usuários]
 *     x-public: true
 *     summary: Autenticação de usuário
 *     description: Endpoint para autenticar usuários
 *     // ... restante da documentação
 */
router.post('/login', AuthController.getByUserName);
```

Rotas sem este atributo ou com `x-public: false` serão automaticamente filtradas da documentação em ambiente de produção.

#### Como Funciona

A filtragem é realizada automaticamente com base no ambiente:

- **Desenvolvimento/Homologação**: Todas as rotas são exibidas no Swagger, independentemente do atributo `x-public`.
- **Produção**: Apenas rotas com `x-public: true` são exibidas no Swagger.

A implementação segue as melhores práticas:

1. Utiliza atributos de extensão do OpenAPI (`x-public`) em vez de sobrecarregar as tags, evitando duplicação na interface do Swagger.
2. A filtragem é realizada durante a geração das especificações do Swagger, o que é mais eficiente.
3. A lógica está contida nos módulos específicos (`src/swagger/erp/config.js` e `src/swagger/g4flex/config.js`), garantindo uma melhor separação de responsabilidades.

#### Personalização da Filtragem

Se necessário, você pode personalizar a lógica de filtragem editando os métodos `getFilteredSpec()` nos arquivos de configuração do Swagger:

- `src/swagger/erp/config.js`
- `src/swagger/g4flex/config.js`

Por exemplo, para incluir rotas com outros critérios em produção, modifique a condição de filtragem conforme necessário.

## Controle de Idempotência para Requisições URA

O sistema implementa um mecanismo de controle de idempotência para requisições originadas da URA (Unidade de Resposta Audível), permitindo múltiplas operações diferentes dentro da mesma sessão/ligação.

### Conceito

Em uma mesma ligação telefônica (identificada pelo `idURA`), podem ocorrer múltiplas requisições de diferentes tipos:
- Consulta de OS
- Criação de OS
- Cancelamento de OS
- Entre outras operações

O controle de idempotência garante que uma mesma operação não seja processada mais de uma vez, mesmo que o cliente envie requisições duplicadas.

### Implementação

O mecanismo utiliza Redis para armazenar chaves de idempotência com TTL (Time To Live):

1. **Chave de idempotência**: Combinação única de:
   - ID da sessão URA (`idURA`)
   - Tipo de requisição (`tipoRequisicao`)
   - Hash do conteúdo da requisição

2. **Middleware**: `preventDuplicateURARequest.js` verifica se uma requisição idêntica já foi processada.

3. **TTL**: As chaves expiram automaticamente após um período configurável (padrão: 10 minutos).

### Como usar

Adicione o middleware nas rotas que precisam de controle de idempotência:

```javascript
import preventDuplicateURARequest from '../middlewares/preventDuplicateURARequest';

// Aplicando o middleware em uma rota
router.post('/work-orders', authG4Flex, preventDuplicateURARequest, WorkOrderController.create);
```

### Requisitos para o cliente

O cliente deve enviar nos payloads:
- `idURA`: Identificador único da sessão/ligação
- `tipoRequisicao`: Identificador do tipo de operação (ex: "criar-os", "cancelar-os")

### Configuração

As seguintes variáveis de ambiente podem ser configuradas:
- `URA_REQUEST_TTL`: Tempo de vida da chave de idempotência em segundos (padrão: 600)
- Configurações do Redis: `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, etc.
