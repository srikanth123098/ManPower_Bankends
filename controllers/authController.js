// controllers/authController.js
// Fixed demo login (no registration). Matches your frontend fixed creds.
const FIXED_USER = { email: 'MPGCNT@A1', password: 'CNT1073', name: 'Daram Sai Jaswanth Reddy' };

exports.login = (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'Missing email or password' });

  if (email === FIXED_USER.email && password === FIXED_USER.password) {
    // demo token (not JWT) for simplicity; frontend just stores it
    return res.json({
      token: 'fixed-demo-token',
      user: { name: FIXED_USER.name, email: FIXED_USER.email }
    });
  } else {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
};
