"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _WorkOrderPhotoService = require('../services/WorkOrderPhotoService'); var _WorkOrderPhotoService2 = _interopRequireDefault(_WorkOrderPhotoService);

class WorkOrderPhotoController {
  async uploadPhoto(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Nenhuma foto enviada' });
      }

      // Extrai os parâmetros da requisição
      const { numeroOS, descricao, sequencia, codigoEmpresa } = req.body;

      // Chama o serviço para enviar ao ERP
      const response = await _WorkOrderPhotoService2.default.sendToERP(req.file, {
        numeroOS,
        descricao,
        sequencia,
        codigoEmpresa,
      });

      return res.json({ message: 'Foto enviada com sucesso', data: response });
    } catch (error) {
      console.error('Erro ao processar a foto:', error);
      return res.status(500).json({ error: 'Erro ao enviar a foto para o ERP' });
    }
  }
}

exports. default = new WorkOrderPhotoController();
