const swaggerDefinition = {
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
      url: 'http://localhost:3000',
      description: 'Servidor Local'
    },
    {
      url: 'https://api.conabplus.com.br',
      description: 'Servidor de Produção'
    },
    {
      url: 'https://staging.conabplus.com.br',
      description: 'Servidor de Homologação'
    }
  ],
  tags: [
    {
      name: 'Autenticação - Integração da URA G4Flex com a Conab+',
      description: 'Endpoints para autenticação e geração de tokens'
    },
    {
      name: 'Contratos - Integração da URA G4Flex com a Conab+',
      description: 'Endpoints para gerenciamento de contratos da Conab+ via URA G4Flex'
    },
    {
      name: 'Ordens de Serviço - Integração da URA G4Flex com a Conab+',
      description: 'Endpoints para gerenciamento de Ordens de Serviço da Conab+ via URA G4Flex'
    }
  ]
};

export default swaggerDefinition;
