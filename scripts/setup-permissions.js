const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Função para executar comandos e aguardar seu término
async function runCommand(command) {
  try {
    console.log(`Executando: ${command}`);
    const { stdout, stderr } = await execPromise(command);

    if (stdout) console.log(`Saída: ${stdout}`);
    if (stderr) console.error(`Erro: ${stderr}`);

    return true;
  } catch (error) {
    console.error(`Erro ao executar comando: ${error.message}`);
    return false;
  }
}

// Função para remover migrações existentes caso seja necessário
async function undoMigrations() {
  const migrations = [
    '20250801000003-create-user-roles.js',
    '20250801000002-create-role-permissions.js',
    '20250801000001-create-permissions.js',
    '20250801000001-create-roles.js',
    '20250801000000-add-unique-index-user-sessions.js',
    '20250801000000-create-roles.js'
  ];

  for (const migration of migrations) {
    try {
      await runCommand(`npx sequelize-cli db:migrate:undo --name ${migration}`);
    } catch (error) {
      console.log(`Migração ${migration} não encontrada ou não pode ser desfeita.`);
    }
  }

  console.log('Migrações removidas com sucesso!');
}

// Função principal que executa os comandos na sequência
async function setupPermissions() {
  console.log('Iniciando configuração de permissões...');

  try {
    // Opcionalmente desfazer migrações existentes
    // await undoMigrations();

    // Executar migrações na ordem correta
    // 1. Adicionar índice único ao user_name
    await runCommand('npx sequelize-cli db:migrate --name 20250801000000-add-unique-index-user-sessions.js');

    // 2. Criar tabela de roles
    await runCommand('npx sequelize-cli db:migrate --name 20250801000001-create-roles.js');

    // 3. Criar tabela de permissions
    await runCommand('npx sequelize-cli db:migrate --name 20250801000001-create-permissions.js');

    // 4. Criar tabela de role_permissions
    await runCommand('npx sequelize-cli db:migrate --name 20250801000002-create-role-permissions.js');

    // 5. Criar tabela de user_roles
    await runCommand('npx sequelize-cli db:migrate --name 20250801000003-create-user-roles.js');

    // 6. Executar o seeder de permissões padrão
    await runCommand('npx sequelize-cli db:seed --seed 20250801100000-default-permissions-fixed.js');

    // 7. Executar o seeder de permissões de ordens de serviço
    await runCommand('npx sequelize-cli db:seed --seed 20250801200000-workorder-permissions.js');

    console.log('Configuração de permissões concluída com sucesso!');
  } catch (error) {
    console.error(`Erro na configuração: ${error.message}`);
  }
}

// Executar a função principal
setupPermissions();
