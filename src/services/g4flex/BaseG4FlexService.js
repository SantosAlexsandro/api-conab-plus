import axios from 'axios';

class BaseG4FlexService {
  constructor() {
    this.apiUrl = "https://erpteste.conab.com.br:7211";
    this.token = "fwqSxis3uU79zWrAxDMAhvtLCMLlyrjQZ44veS2MoTSppX9k4xFJURiEt+UQwpEqFLV77fhb+35l0hVovHB/am51s0ieQvhGCh7FZ2IEnOpdQAHZlltOxVO19iawFO9r8s/3ynyM4BjsRhSq/gJF8mF1nszLuNMwuxKZ74T7eXlMLjpxjmkmX4SxdIa6PlMXgC/PwPRTisBm1Dz7/1KSVpmgokToGoVV/91pVS8DNAXTSI9eR91xccZkOqyVjzDUlO7sj9vRlz9owJ6JUULmt+utMcnDI/gM9PUyCPUSSFJn0sFLmTbenEQnLQJLNf53dxqE+NmuXlB9GDPbnkPeCAcsfBq2CXnqRvPfKy1zBR8HpTSD120NSS2R6ccQkT6kTya1DIzASi3D6/ZgE69cJyXNcwl1nJhhbbv1znxU22AnX4plGMi3kvbv7Ten+QsEKqNDvvqpYCtbsAdanIAMVkkGyQDscZ92TIIrpZ1KHSM=";

    this.axiosInstance = axios.create({
      baseURL: this.apiUrl,
      timeout: 20000,
      headers: {
        "Riosoft-Token": this.token,
        Accept: "application/json, text/plain, */*",
      },
    });
  }

  /**
   * Gets customer data using CPF or CNPJ
   * @param {string} document - Customer CPF or CNPJ
   * @returns {Promise<{codigo: string, nome: string}>} Customer data
   */
  async getCustomerData(document) {
    try {
      if (!document) {
        throw new Error('Document (CPF/CNPJ) not provided');
      }

      const response = await this.axiosInstance.get(
        `/api/Entidade/RetrievePage?filter=CPFCNPJ=${document}&order=&pageSize=10&pageIndex=1`
      );

      if (!response.data || response.data.length === 0) {
        throw { status: 404, message: 'Customer not found' };
      }

      return {
        codigo: response.data[0].Codigo,
        nome: response.data[0].Nome
      };

    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Gets customer data using customer ID
   * @param {string} customerId - Customer ID
   * @returns {Promise<{codigo: string, nome: string}>} Customer data
   */
  async getCustomerDataById(customerId) {
    try {
      if (!customerId) {
        throw new Error('Customer ID not provided');
      }

      const response = await this.axiosInstance.get(
        `/api/Entidade/RetrievePage?filter=Codigo=${customerId}&order=&pageSize=10&pageIndex=1`
      );

      if (!response.data || response.data.length === 0) {
        throw { status: 404, message: 'Customer not found' };
      }

      return {
        codigo: response.data[0].Codigo,
        nome: response.data[0].Nome
      };

    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Handles API errors
   * @param {Error} error - Error occurred
   */
  handleError(error) {
    if (error.response) {
      console.error("API Response Error:", error.response.data);
      console.error("Status:", error.response.status);
      console.error("Headers:", error.response.headers);
    } else if (error.request) {
      console.error("No API response received:", error.request);
    } else {
      console.error("Error setting up request:", error.message);
    }
  }
}

export default BaseG4FlexService;
