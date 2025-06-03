# Documentação API ConabPlus

Este diretório contém documentação detalhada sobre os componentes e funcionalidades da API ConabPlus.

## Sumário

- [Sistema de Permissões e Perfis](./permission-system.md) - Documentação sobre o sistema RBAC de controle de acesso
- [Notificações Push](./push-notifications.md) - Documentação sobre o sistema de notificações push
- [Work Order Queue API](./work-order-queue-api.md) - API para controle de edição de ordens de trabalho na fila de espera

## Visão Geral

A API ConabPlus utiliza Node.js com Express e Sequelize, seguindo uma arquitetura de camadas:

- **Models**: Representações de entidades do banco de dados
- **Controllers**: Lógica de manipulação de requisições
- **Services**: Regras de negócio e interações com modelos
- **Middlewares**: Interceptadores para processamento de requisições
- **Routes**: Definições de rotas da API

## Arquitetura de Segurança

O sistema implementa várias camadas de segurança:

1. **Autenticação**: Utilizando JWT (JSON Web Tokens)
2. **Autorização**: Sistema RBAC (Role-Based Access Control) baseado em perfis e permissões
3. **Validação**: Middleware para validar entrada de dados
4. **Tratamento de Erros**: Captura e formatação padronizada de erros

## Banco de Dados

A API utiliza MariaDB como banco de dados principal e o Sequelize como ORM para:
- Definição de modelos
- Migrações de esquema
- Seeders para dados iniciais

## Desenvolvimento

Para mais informações sobre padrões de desenvolvimento e boas práticas adotadas no projeto, consulte os documentos específicos.
