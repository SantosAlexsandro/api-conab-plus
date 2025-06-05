// import Entity from '../models/Entity';
import EntityService from '../services/EntityService';

class EntityController {
  async create(req, res) {
    try {
      const newEntity = await EntityService.create(req.body);
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
        const newEntity = await EntityService.update(req.body);
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
      const savedPartialData = await EntityService.savePartialData(req.body);

      if (!savedPartialData) {
        return res.status(400).json({ error: "Erro ao salvar os dados parciais." });
      }

      const { data } = savedPartialData;
      return res.json(data);
    } catch (e) {
      console.error("Erro no savePartialData:", e);

      // Garante que o erro seja sempre um array para evitar erros no map()
      const errorMessage = e.errors?.map((err) => err.message) || [e.message];

      return res.status(400).json({ errors: errorMessage });
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

    // Retorna entidade por filtro das propriedades
    async getByFilter(req, res) {
      try {
        const { field, value } = req.query;

        if (!field || !value) {
          return res.status(400).json({
            errors: ['Os parâmetros "field" e "value" são obrigatórios']
          });
        }

        const result = await EntityService.getEntityByProperty(field, value);
        return res.json(result.data);
      } catch (e) {
        console.error('Erro no getByFilter:', e);

        if (e.status === 404) {
          return res.status(404).json({ message: e.message });
        }

        return res.status(400).json({
          errors: e.errors?.map((err) => err.Message) || [e.message]
        });
      }
    }


  // Show
  async show(req, res) {
    try {
      const entity = await EntityService.getById(req.params.id);
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

export default new EntityController();
