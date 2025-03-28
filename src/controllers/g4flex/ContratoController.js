import ContratoService from '../../services/g4flex/ContratoService';

class ContratoController {
  async verificarContrato(req, res) {
    try {
      const { cpf, cnpj, codigoCliente } = req.query;

      if (!cpf && !cnpj && !codigoCliente) {
        return res.status(400).json({
          error: 'É necessário informar CPF, CNPJ ou código do cliente'
        });
      }

      const resultado = await ContratoService.verificarContratoAtivo(cpf, cnpj, codigoCliente);

      return res.json(resultado);
    } catch (error) {
      return res.status(500).json({
        error: 'Erro ao verificar contrato',
        message: error.message
      });
    }
  }
}

export default new ContratoController();
