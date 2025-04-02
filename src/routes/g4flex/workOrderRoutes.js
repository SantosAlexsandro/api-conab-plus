import { Router } from 'express';
import workOrderController from '../../controllers/g4flex/WorkOrderController';

const router = new Router();

/**
 * @route GET /g4flex/work-orders/check-open
 * @description Check if customer has any open (unfinished) work orders
 * @query {string} [cpf] - Customer CPF (11 digits)
 * @query {string} [cnpj] - Customer CNPJ (14 digits)
 * @query {string} [customerId] - Customer ID in G4Flex
 * @returns {Object} Information about customer's open work orders
 */
router.get('/check-open', workOrderController.checkWorkOrder);
router.post('/close', workOrderController.closeWorkOrder);

export default router;
