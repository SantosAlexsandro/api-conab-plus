"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }// import Entity from '../models/Entity';
var _EntityService = require('../services/EntityService'); var _EntityService2 = _interopRequireDefault(_EntityService);

class EntityController {
  async create(req, res) {
    try {
      const newEntity = await _EntityService2.default.create(req.body);
      const { data } = newEntity;
      return res.json( data );
    } catch (e) {
      console.log(e)
      return res.status(400).json({ errors: e.errors.map((err) => err.Message) });
    }
  }

  // Update
  async update(req, res) {
      try {
        const newEntity = await _EntityService2.default.update(req.body);
        const { data } = newEntity;

        return res.json( data );
      } catch (e) {
        console.log(e)
        return res.status(400).json({ errors: e.errors.map((err) => err.Message) });
      }
  }

  async savePartialData(req, res) {
    try {
      console.log('req.body', req.body);
      const savedPartialData = await _EntityService2.default.savePartialData(req.body);

      if (!savedPartialData) {
        return res.status(400).json({ error: "Erro ao salvar os dados parciais." });
      }

      const { data } = savedPartialData;
      return res.json(data);
    } catch (e) {
      console.error("Erro no savePartialData:", e);

      // Garante que o erro seja sempre um array para evitar erros no map()
      const errorMessage = _optionalChain([e, 'access', _ => _.errors, 'optionalAccess', _2 => _2.map, 'call', _3 => _3((err) => err.message)]) || [e.message];

      return res.status(400).json({ errors: errorMessage });
    }
  }



  async getAll(req, res) {
    try {
      const { page = 1, filter = "" } = req.query;
      const { data } = await _EntityService2.default.getAll(page, filter);
      return res.json(data);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // Show
  async show(req, res) {
    try {
      const entity = await _EntityService2.default.getById(req.params.id);
      const { id, nome, email } = entity;
      return res.json(entity);
    } catch (e) {
      return res.status(400).json({ errors: e.errors.map((err) => err.Message) });
    }
  }



/*
  // Update
  async update(req, res) {
    try {
      const user = await Entity.findByPk(req.userId);
      if (!user) {
        return res.status(400).json({
          errors: ['Usuário não existe.'],
        });
      }
      const novosDados = await user.update(req.body);
      const { id, nome, email } = novosDados;
      return res.json({ id, nome, email });
    } catch (e) {
      return res.status(400).json({ errors: e.errors.map((err) => err.message) });
    }
  }

  // Delete
  async delete(req, res) {
    try {
      const user = await Entity.findByPk(req.userId);
      if (!user) {
        return res.status(400).json({
          errors: ['Usuário não existe.'],
        });
      }
      await user.destroy();
      return res.json(null);
    } catch (e) {
      return res.status(400).json({ errors: e.errors.map((err) => err.message) });
    }
  }*/


}

exports. default = new EntityController();
