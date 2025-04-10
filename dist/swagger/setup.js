"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _express = require('express'); var _express2 = _interopRequireDefault(_express);
var _swaggeruiexpress = require('swagger-ui-express'); var _swaggeruiexpress2 = _interopRequireDefault(_swaggeruiexpress);
var _config = require('./g4flex/config'); var _config2 = _interopRequireDefault(_config);
var _config3 = require('./erp/config'); var _config4 = _interopRequireDefault(_config3);

// Função para configurar o Swagger na aplicação
 const setupSwagger = (app) => {
  // Middleware para servir a página inicial da documentação (deve vir antes das outras rotas específicas)
  app.use('/api-docs', _express2.default.static('src/swagger/static'));

  // Endpoint para acessar o JSON da especificação do g4flex
  app.get('/api-docs/g4flex.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(_config2.default);
  });

  // Endpoint para acessar o JSON da especificação do ERP
  app.get('/api-docs/erp.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(_config4.default);
  });

  // Rota principal que redireciona para a página inicial da documentação
  app.get('/api-docs', (req, res) => {
    res.redirect('/api-docs/index.html');
  });

  // Criando instâncias separadas para cada documentação
  const g4flexOptions = {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Integração URA G4Flex com Conab+',
    swaggerOptions: {
      url: '/api-docs/g4flex.json',
      persistAuthorization: true
    }
  };

  const erpOptions = {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'API ERP - Conab+',
    swaggerOptions: {
      url: '/api-docs/erp.json',
      persistAuthorization: true
    }
  };

  // Rotas para acessar as documentações (devem vir por último)
  // Usando o padrão recomendado do Swagger UI Express para múltiplas APIs
  const g4flexServer = _swaggeruiexpress2.default.serveFiles(_config2.default, g4flexOptions);
  const erpServer = _swaggeruiexpress2.default.serveFiles(_config4.default, erpOptions);

  app.use('/api-docs/g4flex', g4flexServer, _swaggeruiexpress2.default.setup(_config2.default, g4flexOptions));
  app.use('/api-docs/erp', erpServer, _swaggeruiexpress2.default.setup(_config4.default, erpOptions));

  console.log('Swagger configurado com sucesso!');
}; exports.setupSwagger = setupSwagger;

exports. default = exports.setupSwagger;
