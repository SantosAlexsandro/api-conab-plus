import jwt from "jsonwebtoken";

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

    // Verifica se é um token de integração G4Flex
    if (decoded.type !== 'integration' || decoded.integration !== 'g4flex') {
      return res.status(401).json({ message: "Token inválido para acesso à API G4Flex." });
    }

    // Verificar se o clientId é válido
    if (decoded.clientId !== process.env.G4FLEX_CLIENT_ID) {
      return res.status(401).json({ message: "Cliente não autorizado para integração G4Flex" });
    }

    // Adicionar informações do G4Flex à requisição
    req.integration = {
      name: 'g4flex',
      clientId: decoded.clientId,
    };

    next();
  } catch (error) {
    console.error("Erro de autenticação G4Flex:", error);
    return res.status(401).json({
      message: error.message || "Token inválido ou expirado.",
    });
  }
};
