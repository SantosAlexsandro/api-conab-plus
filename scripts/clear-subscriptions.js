require('dotenv').config();
const { Sequelize } = require('sequelize');

// Configuração do banco de dados a partir das variáveis de ambiente
const dbConfig = {
  dialect: 'mariadb',
  host: process.env.DATABASE_HOST || 'localhost',
  port: process.env.DATABASE_PORT || 3306,
  username: process.env.DATABASE_USERNAME || 'root',
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE || 'conabplus_db',
  define: {
    timestamps: true,
    underscored: true,
  },
};

// Conectar ao banco de dados
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  dbConfig
);

async function clearSubscriptions() {
  try {
    // Testar a conexão com o banco de dados
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida com sucesso.');

    // Executar uma consulta SQL para limpar todas as assinaturas
    const [results] = await sequelize.query('DELETE FROM push_subscriptions');
    
    console.log('Todas as assinaturas foram removidas com sucesso!');
    console.log(`Número de registros apagados: ${results.affectedRows || 'Desconhecido'}`);
    
  } catch (error) {
    console.error('Erro ao limpar assinaturas:', error);
  } finally {
    // Fechar a conexão com o banco de dados
    await sequelize.close();
    console.log('Conexão com o banco de dados fechada.');
  }
}

// Executar a função principal
clearSubscriptions(); 