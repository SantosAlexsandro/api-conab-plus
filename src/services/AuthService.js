// AuthService

import jwt from "jsonwebtoken";
import axios from "axios";
import { encryptPassword } from "../utils/string/crypto";
import { saveOrUpdateUserSession, calculateSessionExpiration } from "../utils/sessionUtils";
import { decryptPassword } from "../utils/string/crypto";

class AuthService {
  constructor() {
    this.apiUrl = process.env.ERP_API_URL;

    if (!process.env.JWT_TOKEN_SECRET) {
      throw new Error("JWT_TOKEN_SECRET não está definido nas variáveis de ambiente.");
    }

    this.axiosInstance = axios.create({
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

      const encryptedPassword = encryptPassword(payload.Password);

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
        {
          userName: data.Nome,
          type: 'user'
        },
        process.env.JWT_TOKEN_SECRET,
        { expiresIn: Math.floor((endOfDay.getTime() - now.getTime()) / 1000) }
      );

      await saveOrUpdateUserSession({
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
    const password = decryptPassword(session.encryptedPassword);

    const { data, headers } = await this.axiosInstance.post("/api/RsLogin/Login", {
      UserName: session.userName,
      Password: password,
    });

    const erpToken = headers["riosoft-token"];
    if (!erpToken) {
      throw new Error("erpToken não retornado no cabeçalho da API.");
    }

    const expirationDate = calculateSessionExpiration(
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
        `${error.response.data?.Message || "Erro na API"}`
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

export default new AuthService();
