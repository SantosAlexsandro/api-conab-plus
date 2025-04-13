import { Router } from 'express';
import contractController from '../controllers/ContractController';

const router = Router();

/**
 * @route GET /g4flex/contracts/check-active
 * @description Check if customer has any active contracts
 * @query {string} [cpf] - Customer CPF (11 digits)
 * @query {string} [cnpj] - Customer CNPJ (14 digits)
 * @query {string} [customerId] - Customer ID in G4Flex
 * @returns {Object} Information about customer's active contracts
 */


router.get('/check-active', contractController.checkContract);

export default router;
