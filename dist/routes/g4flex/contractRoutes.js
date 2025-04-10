"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _express = require('express');
var _ContractController = require('../../controllers/g4flex/ContractController'); var _ContractController2 = _interopRequireDefault(_ContractController);

const router = _express.Router.call(void 0, );

/**
 * @route GET /g4flex/contracts/check-active
 * @description Check if customer has any active contracts
 * @query {string} [cpf] - Customer CPF (11 digits)
 * @query {string} [cnpj] - Customer CNPJ (14 digits)
 * @query {string} [customerId] - Customer ID in G4Flex
 * @returns {Object} Information about customer's active contracts
 */
router.get('/check-active', _ContractController2.default.checkContract);

exports. default = router;