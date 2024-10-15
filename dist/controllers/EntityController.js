"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _Entity = require('../models/Entity'); var _Entity2 = _interopRequireDefault(_Entity);
var _EntityService = require('../services/EntityService'); var _EntityService2 = _interopRequireDefault(_EntityService);

class EntityController {
  async create(req, res) {
    try {
      const newEntity = await _EntityService2.default.create(req.body);
      const { data } = newEntity;
      return res.json( data );
    } catch (e) {
      return res.status(400).json({ errors: e.errors.map((err) => err.message) });
    }
  }
  /*

  //  Index
  async index(req, res) {
    try {
      const users = await Entity.findAll({ attributes: ['id', 'entity_first_name', 'entity_email', 'entity_phone'] });
      return res.json(users);
    } catch (e) {
      return res.status(400).json({ errors: e.errors.map((err) => err.message) });
    }
  }

  // Show
  async show(req, res) {
    try {
      const user = await Entity.findByPk(req.params.id);
      const { id, nome, email } = user;
      return res.json({ id, nome, email });
    } catch (e) {
      return res.status(400).json({ errors: e.errors.map((err) => err.message) });
    }
  }

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
