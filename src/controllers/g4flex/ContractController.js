import contractService from '../../services/g4flex/ContractService';

class ContractController {
  async checkContract(req, res) {
    try {
      const { cpf, cnpj, customerId } = req.query;

      if (!customerId && !cpf && !cnpj) {
        return res.status(400).json({ error: 'Customer identification is required' });
      }

      const contract = await contractService.checkActiveContract(cpf, cnpj, customerId);
      return res.json(contract);
    } catch (error) {
      console.error('Error checking contract:', error);
      return res.status(500).json({ error: 'Error checking contract status' });
    }
  }
}

export default new ContractController();
