import jwt from "jsonwebtoken";
import UserSession from "../models/UserSession";
import AuthService from "../services/AuthService";
import EntityService from "../services/EntityService";

export default async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Verifica se o token JWT foi fornecido
    if (!authHeader) {
      return res.status(401).json({ message: "Token não fornecido" });
    }

    // Extrai e verifica o token JWT
    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_TOKEN_SECRET);
    } catch (error) {
      return res.status(401).json({ message: "Token inválido ou expirado." });
    }

    // Verifica se é um token de usuário
    if (decoded.type !== 'user') {
      return res.status(401).json({ message: "Tipo de token inválido para esta rota." });
    }

    // Verifica se há uma sessão válida no banco
    const session = await UserSession.findOne({
      where: { userName: decoded.userName },
    });

    if (!session || !session.sessionToken || !session.sessionExpiration) {
      return res.status(401).json({ message: "Sessão inválida ou não encontrada." });
    }

    // Verifica se o token ERP está próximo de expirar
    const expirationTimestamp = new Date(session.sessionExpiration).getTime();

    if (Date.now() > expirationTimestamp - process.env.SESSION_REFRESH_THRESHOLD_MS) {
      console.log("Token de sessão expirado. Renovando o token ERP...");
      const { sessionToken } = await AuthService.refreshSession(session);

      // Adiciona o token renovado ao objeto `req` para os próximos middlewares
      req.sessionToken = sessionToken;
    } else {
      req.sessionToken = session.sessionToken;
    }

    // Armazena informações do usuário na requisição
    req.userId = session.id;
    req.userName = session.userName;

    // Injeta o token ERP dinamicamente no EntityService
    EntityService.setToken(req.sessionToken);

    next();
  } catch (error) {
    console.error("Erro de autenticação:", error);
    return res.status(401).json({
      message: error.message || "Token inválido ou expirado.",
    });
  }
};
