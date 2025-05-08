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
