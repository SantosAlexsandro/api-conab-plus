import axios from "axios";
import FormData from "form-data";
import { Readable } from "stream";

class WorkOrderAudioService {
  constructor() {
    this.apiUrl = "https://erpteste.conab.com.br:7211";
    this.token =
      "fwqSxis3uU79zWrAxDMAhvtLCMLlyrjQZ44veS2MoTSppX9k4xFJURiEt+UQwpEqFLV77fhb+35l0hVovHB/am51s0ieQvhGCh7FZ2IEnOpdQAHZlltOxVO19iawFO9r8s/3ynyM4BjsRhSq/gJF8mF1nszLuNMwuxKZ74T7eXlMLjpxjmkmX4SxdIa6PlMXgC/PwPRTisBm1Dz7/1KSVpmgokToGoVV/91pVS8DNAXTSI9eR91xccZkOqyVjzDUlO7sj9vRlz9owJ6JUULmt+utMcnDI/gM9PUyCPUSSFJn0sFLmTbenEQnLQJLNf53dxqE+NmuXlB9GDPbnkPeCAcsfBq2CXnqRvPfKy1zBR8HpTSD120NSS2R6ccQkT6kTya1DIzASi3D6/ZgE69cJyXNcwl1nJhhbbv1znxU22AnX4plGMi3kvbv7Ten+QsEKqNDvvqpYCtbsAdanIAMVkkGyQDscZ92TIIrpZ1KHSM=";

    this.axiosInstance = axios.create({
      baseURL: this.apiUrl,
      timeout: 20000,
      headers: {
        "Riosoft-Token": this.token,
        Accept: "application/json, text/plain, */*",
      },
    });
  }

  async sendToERP(file, metadata) {
    const { numeroOrdemServico, texto, codigoEmpresa, nomeUsuario } = metadata;

    // Criando a URL do ERP com os parâmetros exigidos
    const url = `${this.apiUrl}/api/OrdServ/InserirHistorico?numeroOrdemServico=${numeroOrdemServico}&texto=${encodeURIComponent(texto)}&codigoEmpresa=${codigoEmpresa}&nomeUsuario=${encodeURIComponent(nomeUsuario)}`;

  // Criando um FormData     válido para Node.js
    const formData = new FormData();

    // Convertendo `file.buffer` em um Stream para o FormData
    const fileStream = Readable.from(file.buffer);
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
      throw new Error("Erro ao enviar o áudio para o ERP");
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
export default new WorkOrderAudioService();

