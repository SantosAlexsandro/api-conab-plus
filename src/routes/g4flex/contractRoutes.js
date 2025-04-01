import { Router } from 'express';
import contractController from '../../controllers/g4flex/ContractController';

const router = Router();

/**
 * @route GET /g4flex/contracts/check
 * @query {string} [cpf] - Customer CPF
 * @query {string} [cnpj] - Customer CNPJ
 * @query {string} [customerId] - Customer ID
 * @returns {Object} Active contract information
 */
router.get('/check', contractController.checkContract);

export default router;