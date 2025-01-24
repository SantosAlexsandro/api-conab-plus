import jwt from 'jsonwebtoken';
// import Entity from '../models/Entity';

export default async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({
      errors: ['Login required'],
    });
  }
  const [, token] = authorization.split(' ');

  // Verifica se o token de sessão do ERP está próximo de expirar
  if (erpSessionToken && erpSessionExpiration && Date.now() > erpSessionExpiration - 2 * 60 * 1000) {
    // Renova o token de sessão do ERP
    const erpResponse = await axios.post('http://erp.local/api/refresh-token', {
      sessionToken: erpSessionToken,
    });

    erpSessionToken = erpResponse.data.TokenId;
    erpSessionExpiration = new Date(erpResponse.data.ExpirationDate).getTime();
  }

  try {
    const dados = jwt.verify(token, process.env.TOKEN_SECRET);
    const { id, email } = dados;

    const user = await Entity.findOne({
      where: {
        id,
        email,
      },
    });

    if (!user) {
      return res.status(401).json({
        errors: ['Usuário inválido.'],
      });
    }

    req.userId = id;
    req.userEmail = email;
    return next();
  } catch (e) {
    return res.status(401).json({
      errors: ['Token expirado ou inválido.'],
    });
  }
};
