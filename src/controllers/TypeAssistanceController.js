import TypeAssistanceService from "../services/TypeAssistanceService"; // Atualize para usar 'import' com a extensão '.js'

class TypeAssistanceController {
  async getAll(req, res) {
    try {
      const response = await TypeAssistanceService.getAll();
      const { data } = response;

      const updatedData = data.map((typeAssistance) => ({
        Codigo: typeAssistance.Codigo,
        Nome: typeAssistance.Descricao,
      }));

      return res.json(updatedData);
    } catch (e) {
      return res
        .status(400)
        .json({ errors: e.errors.map((err) => err.message) });
    }
  }
}

export default new TypeAssistanceController();
