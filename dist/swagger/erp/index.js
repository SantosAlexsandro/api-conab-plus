"use strict";Object.defineProperty(exports, "__esModule", {value: true});const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API ERP - Conab+',
    version: '1.0.0',
    description: 'Documentação da API de integração com ERP',
    contact: {
      name: 'Equipe de Desenvolvimento',
      email: 'alexsandro.santos@conab.com.br'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor Local'
    },
    {
      url: 'https://api.conabplus.com.br',
      description: 'Servidor de Produção'
    },
    {
      url: 'https://staging-api.conabplus.com.br',
      description: 'Servidor de Homologação'
    }
  ],
  tags: [
    {
      name: 'ERP - Usuários',
      description: 'Endpoints para gerenciamento de usuários no ERP'
    },
    {
      name: 'ERP - Produtos',
      description: 'Endpoints para gerenciamento de produtos no ERP'
    },
    {
      name: 'ERP - Pedidos',
      description: 'Endpoints para gerenciamento de pedidos no ERP'
    }
  ]
};

exports. default = swaggerDefinition;
