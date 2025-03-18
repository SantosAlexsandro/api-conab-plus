import workOrderAudioService from "../services/WorkOrderAudioService.js";

class WorkOrderAudioController {
  async uploadAudio(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: "Nenhum arquivo de áudio foi enviado",
          message: "É necessário enviar um arquivo de áudio no formato .webm"
        });
      }

      const { numeroOS, descricao, codigoEmpresa} = req.body;

      if (!numeroOS || !descricao || !codigoEmpresa) {
        return res.status(400).json({
          error: "Parâmetros obrigatórios não fornecidos",
          required: ["numeroOS", "descricao", "codigoEmpresa"]
        });
      }

      const metadata = {
        numeroOrdemServico: numeroOS,
        texto: descricao,
        codigoEmpresa: codigoEmpresa,
        nomeUsuario: 'LEONARDO.LIMA'
        // TODO: pegar o nome do usuário logado
      };

      const result = await workOrderAudioService.sendToERP(req.file, metadata);

      return res.status(200).json({
        message: "Áudio enviado com sucesso",
        data: result
      });
    } catch (error) {
      console.error("Erro no controller:", error);
      return res.status(500).json({
        error: "Erro ao processar o upload do áudio",
        details: error.message
      });
    }
  }
}

export default new WorkOrderAudioController();
