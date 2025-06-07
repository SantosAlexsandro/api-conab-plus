import axios from 'axios';

class BaseERPService {
  constructor() {
    // Usar uma instância singleton do axios para evitar múltiplas sessões
    if (!BaseERPService.axiosInstance) {
      // console.log('[BaseERPService] 🔐 Criando nova instância singleton do axios para ERP');
      // console.log('[BaseERPService] 🌐 ERP_API_URL:', process.env.ERP_API_URL);
      // console.log('[BaseERPService] 🔑 ERP_TOKEN (primeiros 10 chars):', process.env.ERP_TOKEN?.substring(0, 10) + '...');

      BaseERPService.axiosInstance = axios.create({
        baseURL: process.env.ERP_API_URL,
        timeout: 20000,
        headers: {
          "Riosoft-Token": process.env.ERP_TOKEN,
          Accept: "application/json, text/plain, */*",
        },
      });

      // Interceptor para logar todas as requisições
      BaseERPService.axiosInstance.interceptors.request.use(
        (config) => {
          // const tokenInUse = config.headers["Riosoft-Token"];
          // console.log(`[BaseERPService] 📤 Fazendo requisição para: ${config.url}`);
          // console.log(`[BaseERPService] 🔑 Token sendo usado (primeiros 10 chars): ${tokenInUse?.substring(0, 10)}...`);
          // console.log(`[BaseERPService] 📋 Método: ${config.method?.toUpperCase()}`);
          // console.log(`[BaseERPService] 🏷️ Token definido no env: ${process.env.ERP_TOKEN?.substring(0, 10)}...`);

          // ✅ GARANTIA: Sempre usa o token do .env para evitar conflitos
          config.headers["Riosoft-Token"] = process.env.ERP_TOKEN;

          return config;
        },
        (error) => {
          console.error('[BaseERPService] ❌ Erro na configuração da requisição:', error);
          return Promise.reject(error);
        }
      );

      // Interceptor para logar respostas
      BaseERPService.axiosInstance.interceptors.response.use(
        (response) => {
          // console.log(`[BaseERPService] ✅ Resposta recebida: ${response.status} - ${response.config.url}`);
          return response;
        },
        (error) => {
          const url = error.config?.url || 'URL desconhecida';
          const status = error.response?.status || 'Status desconhecido';
          console.error(`[BaseERPService] ❌ Erro na resposta: ${status} - ${url}`);
          if (error.response?.data?.Message) {
            console.error(`[BaseERPService] 📝 Mensagem do ERP: ${error.response.data.Message}`);
          }
          return Promise.reject(error);
        }
      );

      // console.log('[BaseERPService] ✅ Instância singleton criada com sucesso');
    } else {
      // console.log('[BaseERPService] ♻️ Reutilizando instância singleton existente do axios');
    }

    this.axiosInstance = BaseERPService.axiosInstance;
    this.apiUrl = process.env.ERP_API_URL;
    this.token = process.env.ERP_TOKEN;

    // console.log(`[BaseERPService] 🔧 Instância configurada com token: ${this.token?.substring(0, 10)}...`);
  }

  handleError(error) {
    if (error.response) {
      console.error('API Response Error:', error.response.data);
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('No API response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
  }
}

export default BaseERPService;
