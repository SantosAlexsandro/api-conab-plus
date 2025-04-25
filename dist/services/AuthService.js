"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }// AuthService

var _jsonwebtoken = require('jsonwebtoken'); var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);
var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _crypto = require('../utils/string/crypto');
var _sessionUtils = require('../utils/sessionUtils');


class AuthService {
  constructor() {
    this.apiUrl = "https://erpteste.conab.com.br:7211";

    if (!process.env.JWT_TOKEN_SECRET) {
      throw new Error("JWT_TOKEN_SECRET não está definido nas variáveis de ambiente.");
    }

    this.axiosInstance = _axios2.default.create({
      baseURL: this.apiUrl,
    });
  }

  async authenticateUser(payload) {
    const url = `/api/RsLogin/Login`;
    try {
      console.log("INIT Autenticação", payload);
      const { data, headers } = await this.axiosInstance.post(url, payload);
      const erpToken = headers["riosoft-token"];

      if (!erpToken) {
        throw new Error("erpToken não retornado no cabeçalho da API.");
      }

      console.log("END autenticação", payload);

      const encryptedPassword = _crypto.encryptPassword.call(void 0, payload.Password);

      const now = new Date();
      const endOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59
      );

      const jwtToken = _jsonwebtoken2.default.sign(
        {
          userName: data.Nome,
          type: 'user'
        },
        process.env.JWT_TOKEN_SECRET,
        { expiresIn: Math.floor((endOfDay.getTime() - now.getTime()) / 1000) }
      );

      await _sessionUtils.saveOrUpdateUserSession.call(void 0, {
        userName: data.Nome,
        sessionToken: erpToken,
        encryptedPassword,
      });

      return { token: jwtToken };
    } catch (error) {
      this.handleError(error);
    }
  }

  async refreshSession(session) {
    const password = _crypto.decryptPassword.call(void 0, session.encryptedPassword);

    const { data, headers } = await this.axiosInstance.post("/api/RsLogin/Login", {
      UserName: session.userName,
      Password: password,
    });

    const erpToken = headers["riosoft-token"];
    if (!erpToken) {
      throw new Error("erpToken não retornado no cabeçalho da API.");
    }

    const expirationDate = _sessionUtils.calculateSessionExpiration.call(void 0, 
      parseInt(process.env.SESSION_DURATION_MINUTES || "20", 10)
    );

    session.sessionToken = erpToken;
    session.sessionExpiration = expirationDate;
    await session.save();

    return { sessionToken: erpToken, sessionExpiration: expirationDate };
  }

  handleError(error) {
    if (error.response) {
      console.error("Erro na resposta da API:", error.response.data);
      throw new Error(
        `${_optionalChain([error, 'access', _ => _.response, 'access', _2 => _2.data, 'optionalAccess', _3 => _3.Message]) || "Erro na API"}`
        //  `Erro ${error.response.status}: ${error.response.data?.Message || "Erro na API"}`
      );
    } else if (error.request) {
      console.error("Nenhuma resposta foi recebida:", error.request);
      throw new Error("Nenhuma resposta foi recebida da API.");
    } else {
      console.error("Erro ao configurar a requisição:", error.message);
      throw new Error(`Erro interno: ${error.message}`);
    }
  }
}

exports. default = new AuthService();
