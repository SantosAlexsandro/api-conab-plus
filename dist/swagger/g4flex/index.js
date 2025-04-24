"use strict";Object.defineProperty(exports, "__esModule", {value: true});const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API Conab+ - Integração G4Flex',
    version: '1.0.0',
    description: 'Documentação da API de integração entre a URA G4Flex e a Conab+',
    contact: {
      name: 'Equipe de Desenvolvimento',
      email: 'alexsandro.santos@conab.com.br'
    }
  },
  servers: [
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
      name: 'G4Flex - Autenticação',
      description: 'Endpoints para autenticação e geração de tokens'
    },
    {
      name: 'G4Flex - Contratos',
      description: 'Endpoints para gerenciamento de contratos via URA G4Flex'
    },
    {
      name: 'G4Flex - Ordens de Serviço',
      description: 'Endpoints para gerenciamento de Ordens de Serviço via URA G4Flex'
    }
  ]
};

exports. default = swaggerDefinition;
