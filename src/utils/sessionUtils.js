// utils/sessionUtils.js

import UserSession from "../models/UserSession";

export const calculateSessionExpiration = (minutes = 20) => {
  const now = new Date(); // Hora atual
  const expirationDate = new Date(now.getTime() + minutes * 60 * 1000); // Adiciona os minutos em milissegundos

  return expirationDate;
};

export const saveOrUpdateUserSession = async ({
  userName,
  sessionToken,
  encryptedPassword,
}) => {
  const expirationDate = calculateSessionExpiration(
    parseInt(process.env.SESSION_DURATION_MINUTES || "20", 10) // Garante que o valor é numérico
  );

  console.log("Saving session for user:", userName);

  const session = await UserSession.findOne({ where: { userName } });

  if (session) {
    await UserSession.update(
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
    await UserSession.create({
      userName,
      sessionToken,
      sessionExpiration: expirationDate,
      encryptedPassword,
    });
  }
};
