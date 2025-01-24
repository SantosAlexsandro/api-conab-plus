// AuthService.js
import jwt from "jsonwebtoken";
import express from "express";
import axios from "axios";

// Variável simulando o token de sessão do ERP armazenado no backend
let erpSessionToken = null;
let erpSessionExpiration = null; // Timestamp de expiração do token de sessão do ERP

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
      const { data, headers } = await this.axiosInstance.post(url, payload);
      // Extraindo o token diretamente dos headers
      const token = headers["riosoft-token"];

      if (!token) {
        throw new Error("Token não retornado no cabeçalho da API.");
      }

      // return { token, userData: data };

      // Armazena o token de sessão e sua expiração
      erpSessionToken = token;
      erpSessionExpiration = new Date(data.ExpirationDate).getTime();

       // Gera o JWT válido até o final do dia
    const now = new Date();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const jwtToken = jwt.sign(
      { userName: data.userName, sessionToken: token }, // Payload do JWT //TODO:
      'c4s64veav4d4r45vb1',
      { expiresIn: Math.floor((endOfDay.getTime() - now.getTime()) / 1000) } // Expiração até o fim do dia
    );

    res.json({ jwtToken });


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
