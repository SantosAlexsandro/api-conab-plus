"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);

class BaseERPService {
  constructor() {
    // Usar uma instância singleton do axios para evitar múltiplas sessões
    if (!BaseERPService.axiosInstance) {
      console.log('[BaseERPService] 🔐 Criando nova instância singleton do axios para ERP');
      console.log('[BaseERPService] 🌐 ERP_API_URL:', process.env.ERP_API_URL);
      console.log('[BaseERPService] 🔑 ERP_TOKEN (primeiros 10 chars):', _optionalChain([process, 'access', _ => _.env, 'access', _2 => _2.ERP_TOKEN, 'optionalAccess', _3 => _3.substring, 'call', _4 => _4(0, 10)]) + '...');

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
          const tokenInUse = config.headers["Riosoft-Token"];
          console.log(`[BaseERPService] 📤 Fazendo requisição para: ${config.url}`);
          console.log(`[BaseERPService] 🔑 Token sendo usado (primeiros 10 chars): ${_optionalChain([tokenInUse, 'optionalAccess', _5 => _5.substring, 'call', _6 => _6(0, 10)])}...`);
          console.log(`[BaseERPService] 📋 Método: ${_optionalChain([config, 'access', _7 => _7.method, 'optionalAccess', _8 => _8.toUpperCase, 'call', _9 => _9()])}`);
          console.log(`[BaseERPService] 🏷️ Token definido no env: ${_optionalChain([process, 'access', _10 => _10.env, 'access', _11 => _11.ERP_TOKEN, 'optionalAccess', _12 => _12.substring, 'call', _13 => _13(0, 10)])}...`);

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
          console.log(`[BaseERPService] ✅ Resposta recebida: ${response.status} - ${response.config.url}`);
          return response;
        },
        (error) => {
          const url = _optionalChain([error, 'access', _14 => _14.config, 'optionalAccess', _15 => _15.url]) || 'URL desconhecida';
          const status = _optionalChain([error, 'access', _16 => _16.response, 'optionalAccess', _17 => _17.status]) || 'Status desconhecido';
          console.error(`[BaseERPService] ❌ Erro na resposta: ${status} - ${url}`);
          if (_optionalChain([error, 'access', _18 => _18.response, 'optionalAccess', _19 => _19.data, 'optionalAccess', _20 => _20.Message])) {
            console.error(`[BaseERPService] 📝 Mensagem do ERP: ${error.response.data.Message}`);
          }
          return Promise.reject(error);
        }
      );

      console.log('[BaseERPService] ✅ Instância singleton criada com sucesso');
    } else {
      console.log('[BaseERPService] ♻️ Reutilizando instância singleton existente do axios');
    }

    this.axiosInstance = BaseERPService.axiosInstance;
    this.apiUrl = process.env.ERP_API_URL;
    this.token = process.env.ERP_TOKEN;

    console.log(`[BaseERPService] 🔧 Instância configurada com token: ${_optionalChain([this, 'access', _21 => _21.token, 'optionalAccess', _22 => _22.substring, 'call', _23 => _23(0, 10)])}...`);
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
