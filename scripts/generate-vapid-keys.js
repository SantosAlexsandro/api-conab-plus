const webpush = require('web-push');
const fs = require('fs');
const path = require('path');

// Gerar as chaves VAPID
const vapidKeys = webpush.generateVAPIDKeys();

console.log('Chaves VAPID geradas com sucesso:');
console.log('=================================');
console.log('Chave Pública:');
console.log(vapidKeys.publicKey);
console.log('\nChave Privada:');
console.log(vapidKeys.privateKey);
console.log('=================================');

// Criar conteúdo para o arquivo .env
const envContent = `
# Chaves VAPID para notificações push
VAPID_PUBLIC_KEY=${vapidKeys.publicKey}
VAPID_PRIVATE_KEY=${vapidKeys.privateKey}
VAPID_SUBJECT=mailto:contato@conabplus.com.br
`;

// Verificar se o arquivo .env existe
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  // Ler o conteúdo atual
  let currentEnv = fs.readFileSync(envPath, 'utf8');
  
  // Verificar se as variáveis VAPID já existem
  const hasVapidConfig = currentEnv.includes('VAPID_PUBLIC_KEY=');
  
  if (hasVapidConfig) {
    console.log('Arquivo .env já contém configuração VAPID. Atualizando...');
    
    // Atualizar as variáveis existentes
    currentEnv = currentEnv
      .replace(/VAPID_PUBLIC_KEY=.*\n/, `VAPID_PUBLIC_KEY=${vapidKeys.publicKey}\n`)
      .replace(/VAPID_PRIVATE_KEY=.*\n/, `VAPID_PRIVATE_KEY=${vapidKeys.privateKey}\n`);
    
    fs.writeFileSync(envPath, currentEnv);
  } else {
    console.log('Adicionando configuração VAPID ao arquivo .env existente...');
    fs.appendFileSync(envPath, envContent);
  }
} else {
  console.log('Criando arquivo .env com configuração VAPID...');
  fs.writeFileSync(envPath, envContent.trim());
}

console.log('\nConfiguração VAPID salva com sucesso no arquivo .env');
console.log('\nCertifique-se de reiniciar o servidor para aplicar as alterações!'); 