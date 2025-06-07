"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _formdata = require('form-data'); var _formdata2 = _interopRequireDefault(_formdata);
var _stream = require('stream');

class WorkOrderPhotoService {
  constructor() {
    this.apiUrl = process.env.ERP_API_URL;
    this.token = process.env.ERP_TOKEN;

    this.axiosInstance = _axios2.default.create({
      baseURL: this.apiUrl,
      timeout: 20000,
      headers: {
        "Riosoft-Token": this.token,
        Accept: "application/json, text/plain, */*",
      },
    });
  }

  async sendToERP(file, metadata) {
    const { numeroOS, descricao, sequencia, codigoEmpresa } = metadata;

    // Criando a URL do ERP com os parâmetros exigidos
    const url = `${this.apiUrl}/api/OrdServ/InserirFoto?numeroOS=${numeroOS}&descricao=${encodeURIComponent(descricao)}&sequencia=${sequencia}&codigoEmpresa=${codigoEmpresa}`;

    console.log("url", url);
    // Criando um FormData válido para Node.js
    const formData = new (0, _formdata2.default)();

    // Convertendo `file.buffer` em um Stream para o FormData
    const fileStream = _stream.Readable.from(file.buffer);
    formData.append("file", fileStream, file.originalname);

    try {
      const response = await this.axiosInstance.post(url, formData, {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${this.token}`,
        },
      });

      return response.data;
    } catch (error) {
      this.handleError(error);
      throw new Error("Erro ao enviar a foto para o ERP");
    }
  }

  // Método para lidar com erros de forma padronizada
  handleError(error) {
    if (error.response) {
      console.error("Erro na resposta da API:", error.response.data);
      console.error("Status:", error.response.status);
      console.error("Headers:", error.response.headers);
    } else if (error.request) {
      console.error("Nenhuma resposta da API foi recebida:", error.request);
    } else {
      console.error("Erro ao configurar a requisição:", error.message);
    }
  }
}

// Exporta uma instância da classe
exports. default = new WorkOrderPhotoService();
