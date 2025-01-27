"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }// utils/sessionUtils.js

var _UserSession = require('../models/UserSession'); var _UserSession2 = _interopRequireDefault(_UserSession);

 const calculateSessionExpiration = (minutes = 20) => {
  const now = new Date(); // Hora atual
  const expirationDate = new Date(now.getTime() + minutes * 60 * 1000); // Adiciona os minutos em milissegundos

  return expirationDate;
}; exports.calculateSessionExpiration = calculateSessionExpiration;

 const saveOrUpdateUserSession = async ({
  userName,
  sessionToken,
  encryptedPassword,
}) => {
  const expirationDate = exports.calculateSessionExpiration.call(void 0, 
    parseInt(process.env.SESSION_DURATION_MINUTES || "20", 10) // Garante que o valor é numérico
  );

  console.log("Saving session for user:", userName);

  const session = await _UserSession2.default.findOne({ where: { userName } });

  if (session) {
    await _UserSession2.default.update(
      {
        userName,
        sessionToken,
        sessionExpiration: expirationDate,
        encryptedPassword,
      },
      {
        where: { userName },
      }
    );
  } else {
    await _UserSession2.default.create({
      userName,
      sessionToken,
      sessionExpiration: expirationDate,
      encryptedPassword,
    });
  }
}; exports.saveOrUpdateUserSession = saveOrUpdateUserSession;
