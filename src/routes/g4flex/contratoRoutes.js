import { Router } from 'express';
import ContratoController from '../../controllers/g4flex/ContratoController';

const router = Router();

/**
 * @route GET /g4flex/contrato/verificar
 * @query {string} [cpf] - CPF do cliente
 * @query {string} [cnpj] - CNPJ do cliente
 * @query {string} [codigoCliente] - Código do cliente
 * @returns {Object} Informações sobre o contrato ativo do cliente
 */
router.get('/verificar', ContratoController.verificarContrato);

export default router;
