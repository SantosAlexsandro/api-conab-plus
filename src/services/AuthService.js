// AuthService.js

import jwt from "jsonwebtoken";
import axios from "axios";
import UserSession from "../models/UserSession";
import bcrypt from "bcrypt";
import { encryptPassword } from "../utils/string/crypto";

class AuthService {
  constructor() {
    this.apiUrl = "https://erpteste.conab.com.br:7211";

    // Instância configurada do Axios
    this.axiosInstance = axios.create({
      baseURL: this.apiUrl,
    });
  }

  async authenticateUser(payload) {
    const url = `/api/RsLogin/Login`;
    try {
      console.log("INIT Autenticação", payload);
      const { data, headers } = await this.axiosInstance.post(url, payload);
      // Extraindo o erpToken diretamente dos headers
      const erpToken = headers["riosoft-token"];

      if (!erpToken) {
        throw new Error("erpToken não retornado no cabeçalho da API.");
      }

      console.log("END autenticação", payload);

      // Criptografa a senha
      const encryptedPassword = encryptPassword(payload.Password);
      console.log("encrypted Password", encryptedPassword);

      // Gera o JWT válido até o final do dia
      const now = new Date();
      const endOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59
      );

      const jwtToken = jwt.sign(
        { UserName: data.Nome }, // Payload do JWT
        process.env.JWT_TOKEN_SECRET, //TODO:
        { expiresIn: Math.floor((endOfDay.getTime() - now.getTime()) / 1000) } // Expiração até o fim do dia
      );

      const session = await UserSession.findOne({
        where: { userName: data.Nome },
      });
      if (session) {
        // Obtém a data atual
        const now = new Date();

        // Adiciona 20 minutos à data atual
        const expirationDate = new Date(now);
        expirationDate.setMinutes(now.getMinutes() + 20);

        await UserSession.update(
          {
            userName: data.Nome,
            sessionToken: erpToken,
            sessionExpiration: expirationDate,
            encryptedPassword, // Armazena a senha criptografada
          },
          {
            where: { userName: data.Nome }, // Atualiza registros onde o userName corresponde
          }
        );
      } else {

         // Obtém a data atual
         const now = new Date();

         // Adiciona 20 minutos à data atual
         const expirationDate = new Date(now);
         expirationDate.setMinutes(now.getMinutes() + 20);


        const passwordHash = await bcrypt.hash(payload.Password, 10);

        await UserSession.create({
          userName: data.Nome,
          passwordHash: passwordHash,
          sessionToken: erpToken,
          sessionExpiration: expirationDate,
          encryptedPassword, // Armazena a senha criptografada
        });
      }

      return { token: jwtToken };
    } catch (error) {
      this.handleError(error);
    }
  }

  async refrashSessionToken(payload) {
    const url = `/api/RsLogin/Login`;
    try {
      console.log("Iniciando refrash erpToken", payload);
      const { data, headers } = await this.axiosInstance.post(url, payload);
      // Extraindo o erpToken diretamente dos headers
      const erpToken = headers["riosoft-token"];

      if (!erpToken) {
        throw new Error("erpToken não retornado no cabeçalho da API.");
      }

      console.log("payload", payload);

      const session = await UserSession.findOne({
        where: { userName: data.Nome },
      });

        // Obtém a data atual
        const now = new Date();

        // Adiciona 20 minutos à data atual
        const expirationDate = new Date(now);
        expirationDate.setMinutes(now.getMinutes() + 20);


      if (session) {

        await UserSession.update(
          {
            userName: data.Nome,
            sessionToken: erpToken,
            sessionExpiration: expirationDate,
            //encryptedPassword, // Armazena a senha criptografada
          },
          {
            where: { userName: data.Nome }, // Atualiza registros onde o userName corresponde
          }
        );
      }

      return {
        sessionToken: erpToken,
        sessionExpiration: expirationDate,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  // Método para lidar com erros de forma padronizada
  handleError(error) {
    if (error.response) {
      // Erro de resposta da API
      console.error("Erro na resposta da API:", error.response.data);
      console.error("Status:", error.response.status);
      console.error("Headers:", error.response.headers);
    } else if (error.request) {
      // Nenhuma resposta foi recebida
      console.error("Nenhuma resposta da API foi recebida:", error.request);
    } else {
      // Erro ao configurar a requisição
      console.error("Erro ao configurar a requisição:", error.message);
    }

    throw new Error("Erro ao processar a requisição.");
  }
}

export default new AuthService();
