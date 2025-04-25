import jwt from 'jsonwebtoken';

export function generateG4FlexToken(clientId) {
  return jwt.sign(
    {
      clientId,
      type: 'integration',
      integration: 'g4flex',
    },
    process.env.JWT_TOKEN_SECRET,
    { expiresIn: process.env.G4FLEX_TOKEN_EXPIRATION }
  );
}
