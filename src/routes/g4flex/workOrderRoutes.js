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

/**
 * @route POST /g4flex/work-orders/requests
 * @description Create a new work order request
 * @body {Object} request
 * @body {string} request.productId - Product identification code
 * @body {string} request.requesterName - Name of the person requesting
 * @body {string} request.requesterPosition - Position/role of the requester
 * @body {string} request.incidentDescription - Description of the reported problem
 * @body {string} request.siteContactPerson - Person responsible for the site
 * @returns {Object} Created work order information
 */
router.post('/requests', workOrderController.createWorkOrder);

router.post('/close', workOrderController.closeWorkOrder);

export default router;
