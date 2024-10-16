"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _Transaction = require('../models/Transaction'); var _Transaction2 = _interopRequireDefault(_Transaction);
var _TransactionItem = require('../models/TransactionItem'); var _TransactionItem2 = _interopRequireDefault(_TransactionItem);
// import Item from '../models/Item';
var _Entity = require('../models/Entity'); var _Entity2 = _interopRequireDefault(_Entity);

class TransactionController {
  async index(req, res) {
    const transactions = await _Transaction2.default.findAll({
      attributes: ['id',  ['created_at', 'transaction_date'], 'defected_items_arrival_date', 'transaction_status', 'transaction_total_amount' ],
      order: [['id', 'DESC']],
      include: [
        {
          model: _Entity2.default,
          attributes: ['entity_first_name'],
        }
      ],
    });
    res.status(200).json(transactions);
  }

  async store(req, res) {
    try {
      const transaction = await _Transaction2.default.create(req.body);
      return res.json(transaction);
    } catch (e) {
      return res.status(400).json({
        errors: e.errors.map((err) => err.message),
      });
    }
  }

  async show(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          errors: ['Faltando ID'],
        });
      }
      const transaction = await _Transaction2.default.findByPk(id, {
        attributes: ['id', 'receiving_date', 'defect_description', 'technical_report', 'status_transaction', 'total_service_charge'],
        order: [['id', 'DESC'], [_TransactionItem2.default, 'id', 'DESC']],
        include: {
          model: _TransactionItem2.default,
          attributes: ['quantity', 'unit_price_at_transaction', 'total_price', 'discount', 'tax'],
        },
      });
      if (!transaction) {
        return res.status(400).json({
          errors: ['Transação não existe.'],
        });
      }
      return res.json(transaction);
    } catch (e) {
      return res.status(400).json({
        errors: e.errors.map((err) => err.message),
      });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          errors: ['Faltando ID'],
        });
      }
      const transaction = await _Transaction2.default.findByPk(id);
      if (!transaction) {
        return res.status(400).json({
          errors: ['Transação não existe.'],
        });
      }
      await transaction.destroy();
      return res.json({
        deleted: true,
      });
    } catch (e) {
      return res.status(400).json({
        errors: e.errors.map((err) => err.message),
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          errors: ['Faltando ID'],
        });
      }
      const transaction = await _Transaction2.default.findByPk(id);
      if (!transaction) {
        return res.status(400).json({
          errors: ['Transação não existe.'],
        });
      }
      const transactionUpdated = await transaction.update(req.body);
      return res.json(transactionUpdated);
    } catch (e) {
      return res.status(400).json({
        errors: e.errors.map((err) => err.message),
      });
    }
  }
}

exports. default = new TransactionController();
