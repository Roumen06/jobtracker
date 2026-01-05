import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

export function getUserFromRequest(req) {
  try {
    const cookies = parse(req.headers.cookie || '');
    const token = cookies.auth_token;

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
    return decoded;
  } catch (error) {
    return null;
  }
}

export function requireAuth(req, res) {
  const user = getUserFromRequest(req);
  
  if (!user) {
    res.status(401).json({ error: 'Authentication required' });
    return null;
  }
  
  return user;
}
