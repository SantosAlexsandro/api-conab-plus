export default {
  vapidKeys: {
    publicKey: process.env.VAPID_PUBLIC_KEY || 'BAk8Cz1SkeEL-K1YOC-gPSAdBvd-3zyklCbFYTUxLZzGA2n84dNb1p-4puBS5rJJYy4zDpCAawgaWYDHBg2Y2Bs',
    privateKey: process.env.VAPID_PRIVATE_KEY || 'fQAIMheR69mD0KKaLOc-WPVAJvAK2yZgmI7ZOqjyX8o',
  },
  subject: process.env.VAPID_SUBJECT || 'mailto:contato@conabplus.com.br'
};
