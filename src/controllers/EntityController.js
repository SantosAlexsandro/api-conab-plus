// import Entity from '../models/Entity';
import EntityService from '../services/EntityService';

class EntityController {
  async create(req, res) {
    try {
      const newEntity = await EntityService.create(req.body);
      const { data } = newEntity;
      return res.json( data );
    } catch (e) {
      return res.status(400).json({ errors: e.errors.map((err) => err.message) });
    }
  }


  async getAll(req, res) {
    try {
      const { page = 1, filter = "" } = req.query;
      const { data } = await EntityService.getAll(page, filter);
      return res.json(data);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

   /*
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

export default new EntityController();
