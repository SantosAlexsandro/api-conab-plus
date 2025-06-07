import jwt from "jsonwebtoken";
import UserSession from "../models/UserSession";
import AuthService from "../services/AuthService";

export default async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('🔍 [authUser] Authorization header:', authHeader ? 'Present' : 'Missing');

    // Verifica se o token JWT foi fornecido
    if (!authHeader) {
      console.log('❌ [authUser] No authorization header');
      return res.status(401).json({ message: "Token não fornecido" });
    }

    // Extrai e verifica o token JWT
    const token = authHeader.split(" ")[1];
    console.log('🔍 [authUser] Token extracted:', token ? 'Present' : 'Missing');

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_TOKEN_SECRET);
      console.log('✅ [authUser] Token decoded:', { id: decoded.id, userName: decoded.userName, type: decoded.type });
    } catch (error) {
      console.log('❌ [authUser] Token verification failed:', error.message);
      return res.status(401).json({ message: "Token inválido ou expirado." });
    }

    // Verifica se é um token de usuário
    if (decoded.type !== 'user') {
      console.log('❌ [authUser] Invalid token type:', decoded.type);
      return res.status(401).json({ message: "Tipo de token inválido para esta rota." });
    }

    // Verifica se há uma sessão válida no banco
    const session = await UserSession.findOne({
      where: { userName: decoded.userName },
    });

    console.log('🔍 [authUser] Session found:', session ? { id: session.id, userName: session.userName } : 'Not found');

    if (!session || !session.sessionToken || !session.sessionExpiration) {
      console.log('❌ [authUser] Invalid session');
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

    console.log('✅ [authUser] User data set:', { userId: req.userId, userName: req.userName });

    next();
  } catch (error) {
    console.error("❌ [authUser] Error:", error);
    return res.status(401).json({
      message: error.message || "Token inválido ou expirado.",
    });
  }
};
