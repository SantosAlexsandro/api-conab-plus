const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API G4Flex - Conab Plus',
    version: '1.0.0',
    description: 'Documentação da API de integração com G4Flex',
    contact: {
      name: 'Equipe de Desenvolvimento',
      email: 'dev@conabplus.com.br'
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
      name: 'G4Flex - Contratos',
      description: 'Endpoints para gerenciamento de contratos no G4Flex'
    },
    {
      name: 'G4Flex - Ordens de Serviço',
      description: 'Endpoints para gerenciamento de Ordens de Serviço no G4Flex'
    }
  ]
};

export default swaggerDefinition;
