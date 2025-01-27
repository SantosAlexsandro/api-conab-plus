"use strict";Object.defineProperty(exports, "__esModule", {value: true});class TokenService {
  constructor() {
    this.token = null; // Armazena o token de sessão global
  }

  setToken(token) {
    this.token = token; // Define o token de sessão
  }

  getToken() {
    return this.token; // Retorna o token de sessão
  }
}

exports. default = new TokenService(); // Singleton
