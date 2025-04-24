# API Conab+

## Swagger e Documentação da API

### Filtragem de Rotas por Tags

O Swagger está configurado para mostrar apenas endpoints com tags específicas no ambiente de produção.

#### Uso de Tags

##### 1. Tags Públicas (Public)

As rotas com a tag `Public` são as únicas expostas na documentação Swagger em ambiente de produção.

Exemplo de uso:

```javascript
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Public]
 *     summary: Autenticação de usuário
 *     description: Endpoint para autenticar usuários
 *     // ... restante da documentação
 */
router.post('/login', AuthController.getByUserName);
```

##### 2. Tags Internas (Internal)

As rotas com a tag `Internal` são filtradas e não aparecem na documentação Swagger em ambiente de produção.

Exemplo de uso:

```javascript
/**
 * @swagger
 * /api/user-groups:
 *   get:
 *     tags: [Internal]
 *     summary: Lista todos os grupos de usuários
 *     description: Retorna uma lista de todos os grupos de usuários
 *     // ... restante da documentação
 */
router.get('/', UserGroupController.findAll);
```

#### Como Funciona

A filtragem é realizada automaticamente com base no ambiente:

- **Desenvolvimento/Homologação**: Todas as rotas são exibidas no Swagger, independentemente das tags.
- **Produção**: Apenas rotas com a tag `Public` são exibidas no Swagger.

A implementação segue as melhores práticas:

1. A filtragem é realizada durante a geração das especificações do Swagger, em vez de pós-processamento, o que é mais eficiente.
2. A lógica está contida nos módulos específicos (`src/swagger/erp/config.js` e `src/swagger/g4flex/config.js`), garantindo uma melhor separação de responsabilidades.
3. A implementação é transparente para o desenvolvedor, que só precisa adicionar a tag `Public` às rotas que devem estar disponíveis em produção.

#### Definição de Novas Tags

Para definir uma nova tag, adicione-a na seção `tags` dos arquivos de configuração do Swagger:

- Para o ERP: `src/swagger/erp/index.js`
- Para o G4Flex: `src/swagger/g4flex/index.js`

Exemplo:

```javascript
tags: [
  {
    name: 'Public',
    description: 'Endpoints públicos disponíveis em ambiente de produção'
  },
  // ... outras tags
]
```

#### Personalização da Filtragem

Se necessário, você pode personalizar a lógica de filtragem editando os métodos `getFilteredSpec()` nos arquivos de configuração do Swagger:

- `src/swagger/erp/config.js`
- `src/swagger/g4flex/config.js`

Por exemplo, para incluir rotas com outras tags em produção, modifique a condição de filtragem:

```javascript
// Exemplo: incluir rotas com tags 'Public' ou 'Partner'
operation.tags?.some(tag => ['Public', 'Partner'].includes(tag))
```
