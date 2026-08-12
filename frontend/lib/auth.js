import jwt from 'jsonwebtoken';

export function verifyAuth(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ message: 'No token, authorization denied' });
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    res.status(401).json({ message: 'Token format is invalid (must be Bearer <token>)' });
    return null;
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey_hms2026!');
    return decoded.user; // Contains id, username, role_id, full_name
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
    return null;
  }
}
