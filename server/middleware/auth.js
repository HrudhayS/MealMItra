/**
 * FoodLoop - Authentication & Role Authorization Middleware
 */

export function authenticate(req, res, next) {
  // Extract user info from Authorization header or custom header
  const authHeader = req.headers.authorization;
  const simulatedUserHeader = req.headers['x-simulated-user'];

  if (simulatedUserHeader) {
    try {
      req.user = JSON.parse(simulatedUserHeader);
      return next();
    } catch {
      // ignore JSON parse error
    }
  }

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split('Bearer ')[1];
    // In production with Firebase Admin SDK:
    // const decoded = await adminAuth.verifyIdToken(token);
    // req.user = decoded;
    req.user = { uid: token, email: 'authenticated_user@foodloop.org' };
    return next();
  }

  // Allow anonymous/guest read-only for public endpoints or default demo user
  req.user = null;
  next();
}

/**
 * Enforce minimum role requirement
 * @param {Array<string>} allowedRoles
 */
export function authorizeRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required.' });
    }
    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: Access restricted to roles [${allowedRoles.join(', ')}]. Current role: ${req.user.role}`
      });
    }
    next();
  };
}
