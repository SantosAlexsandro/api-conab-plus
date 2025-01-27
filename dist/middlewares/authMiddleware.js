"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }// authMiffleware

var _jsonwebtoken = require('jsonwebtoken'); var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);
var _UserSession = require('../models/UserSession'); var _UserSession2 = _interopRequireDefault(_UserSession);
var _AuthService = require('../services/AuthService'); var _AuthService2 = _interopRequireDefault(_AuthService);
var _bcrypt = require('bcrypt'); var _bcrypt2 = _interopRequireDefault(_bcrypt);
var _crypto = require('../utils/string/crypto');
var _TokenService = require('../services/TokenService'); var _TokenService2 = _interopRequireDefault(_TokenService);

exports. default = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Token não fornecido" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = _jsonwebtoken2.default.verify(token, process.env.JWT_TOKEN_SECRET); // Já verificar e não permite ir adiante.
    // Se o jwt já não for válido, entendo que o usuário nesse momento precisa ser deslogado, correto?

    console.log("decoded", decoded);

    const session = await _UserSession2.default.findOne({
      where: { userName: decoded.UserName },
    });
    // console.log('session', session)

    if (!session.sessionToken || !session.sessionExpiration) {
      throw new Error("Token de sessão ou expiração não definido.");
    }


    console.log("INIT COMPARE");
    const password = await _bcrypt2.default.compareSync(
      session.dataValues.passwordHash,
      process.env.JWT_TOKEN_SECRET
    ); // Obtenha dinamicamente o hash original
    console.log("password", password);

    // Verifica se o token de sessão do ERP está próximo de expirar ou já expirou
    const expirationTimestamp = new Date(
      session.dataValues.sessionExpiration
    ).getTime();
    console.log("sessionToken:", session.dataValues.sessionToken);
    console.log("sessionExpiration:", session.dataValues.sessionExpiration); // Data de expiração
    console.log("Date.now():", Date.now()); // Tempo atual em milissegundos
    console.log(
      "Threshold:",
      session.dataValues.sessionExpiration - 2 * 60 * 1000
    ); // Limite de 2 minutos


    if (
      session.dataValues.sessionToken &&
      session.dataValues.sessionExpiration &&
      Date.now() > expirationTimestamp - 2 * 60 * 1000
    ) {
      // Token expirado, faz login novamente no ERP
      console.log("Token de sessão expirado. Fazendo login novamente...");
      const password = _crypto.decryptPassword.call(void 0, session.dataValues.encryptedPassword); // Descriptografa a senha

      const response = await _AuthService2.default.refrashSessionToken({
        UserName: decoded.UserName,
        Password: password,
      });

      // Atualiza o token na tabela e no TokenService
      const { sessionToken, sessionExpiration } = response;
      session.sessionToken = sessionToken;
      session.sessionExpiration = sessionExpiration;
      await session.save();

      _TokenService2.default.setToken(sessionToken); // Atualiza o token global
    } else {
      _TokenService2.default.setToken(session.sessionToken); // Define o token atual
    }

    // Atribui o token de sessão validado ao objeto req
    req.sessionToken = session.sessionToken;

    next();
  } catch (error) {
    console.error("Erro de autenticação:", error);
    return res.status(401).json({ message: "Token inválido ou expirado" });
  }
};
