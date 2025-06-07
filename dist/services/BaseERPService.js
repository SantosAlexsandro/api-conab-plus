"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);

class BaseERPService {
  constructor() {
    // Usar uma instância singleton do axios para evitar múltiplas sessões
    if (!BaseERPService.axiosInstance) {
      // console.log('[BaseERPService] 🔐 Criando nova instância singleton do axios para ERP');
      // console.log('[BaseERPService] 🌐 ERP_API_URL:', process.env.ERP_API_URL);
      // console.log('[BaseERPService] 🔑 ERP_TOKEN (primeiros 10 chars):', process.env.ERP_TOKEN?.substring(0, 10) + '...');

      BaseERPService.axiosInstance = _axios2.default.create({
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
          const url = _optionalChain([error, 'access', _ => _.config, 'optionalAccess', _2 => _2.url]) || 'URL desconhecida';
          const status = _optionalChain([error, 'access', _3 => _3.response, 'optionalAccess', _4 => _4.status]) || 'Status desconhecido';
          console.error(`[BaseERPService] ❌ Erro na resposta: ${status} - ${url}`);
          if (_optionalChain([error, 'access', _5 => _5.response, 'optionalAccess', _6 => _6.data, 'optionalAccess', _7 => _7.Message])) {
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

exports. default = BaseERPService;
