import express from 'express';
import swaggerUi from 'swagger-ui-express';
import g4flexSwaggerSpec from './g4flex/config';
import erpSwaggerSpec from './erp/config';

// Função para configurar o Swagger na aplicação
export const setupSwagger = (app) => {
  // Middleware para servir a página inicial da documentação (deve vir antes das outras rotas específicas)
  app.use('/api-docs', express.static('src/swagger/static'));

  // Endpoint para acessar o JSON da especificação do g4flex
  app.get('/api-docs/g4flex.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(g4flexSwaggerSpec);
  });

  // Endpoint para acessar o JSON da especificação do ERP
  app.get('/api-docs/erp.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(erpSwaggerSpec);
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
  const g4flexServer = swaggerUi.serveFiles(g4flexSwaggerSpec, g4flexOptions);
  const erpServer = swaggerUi.serveFiles(erpSwaggerSpec, erpOptions);

  app.use('/api-docs/g4flex', g4flexServer, swaggerUi.setup(g4flexSwaggerSpec, g4flexOptions));
  app.use('/api-docs/erp', erpServer, swaggerUi.setup(erpSwaggerSpec, erpOptions));

  console.log('Swagger configurado com sucesso!');

  // Informação adicional sobre configuração em produção
  if (process.env.NODE_ENV === 'production') {
    console.log('Swagger em modo de produção: exibindo apenas rotas com tag Public');
  }
};

export default setupSwagger;
