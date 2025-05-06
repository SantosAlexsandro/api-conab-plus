import webpush from 'web-push';

const vapidKeys = webpush.generateVAPIDKeys();

console.log('========== CHAVES VAPID GERADAS ==========');
console.log('\nChave Pública:');
console.log(vapidKeys.publicKey);
console.log('\nChave Privada:');
console.log(vapidKeys.privateKey);
console.log('\n=========================================');
console.log('\nAdicione estas chaves ao seu arquivo .env:');
console.log('\nVAPID_PUBLIC_KEY=' + vapidKeys.publicKey);
console.log('VAPID_PRIVATE_KEY=' + vapidKeys.privateKey);
console.log('VAPID_SUBJECT=mailto:seu-email@exemplo.com');
console.log('\n=========================================');
