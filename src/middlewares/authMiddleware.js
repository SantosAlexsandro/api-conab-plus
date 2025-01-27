// authMiffleware

import jwt from "jsonwebtoken";
import UserSession from "../models/UserSession";
import AuthService from "../services/AuthService";
import bcrypt from "bcrypt";
import { decryptPassword } from "../utils/string/crypto";
import TokenService from "../services/TokenService";

export default async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Token não fornecido" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_TOKEN_SECRET); // Já verificar e não permite ir adiante.
    // Se o jwt já não for válido, entendo que o usuário nesse momento precisa ser deslogado, correto?

    console.log("decoded", decoded);

    const session = await UserSession.findOne({
      where: { userName: decoded.UserName },
    });
    // console.log('session', session)

    if (!session.sessionToken || !session.sessionExpiration) {
      throw new Error("Token de sessão ou expiração não definido.");
    }


    console.log("INIT COMPARE");
    const password = await bcrypt.compareSync(
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
      const password = decryptPassword(session.dataValues.encryptedPassword); // Descriptografa a senha

      const response = await AuthService.refrashSessionToken({
        UserName: decoded.UserName,
        Password: password,
      });

      // Atualiza o token na tabela e no TokenService
      const { sessionToken, sessionExpiration } = response;
      session.sessionToken = sessionToken;
      session.sessionExpiration = sessionExpiration;
      await session.save();

      TokenService.setToken(sessionToken); // Atualiza o token global
    } else {
      TokenService.setToken(session.sessionToken); // Define o token atual
    }

    // Atribui o token de sessão validado ao objeto req
    req.sessionToken = session.sessionToken;

    next();
  } catch (error) {
    console.error("Erro de autenticação:", error);
    return res.status(401).json({ message: "Token inválido ou expirado" });
  }
};
