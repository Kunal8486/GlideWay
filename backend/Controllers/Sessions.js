const crypto = require('crypto');
const Session = require('../Models/Sessions');
const User = require('../Models/Rider'); // Assuming you have a Rider model
const Driver = require('../Models/Driver'); // Assuming you have a Driver model
// Login Controller
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user in your database
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate a session token
    const authToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create and save a session
    const session = new Session({ userId: user._id, authToken, expiresAt });
    await session.save();

    // Send the token back to the client
    res.json({ message: 'Login successful', token: authToken });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'An error occurred' });
  }
};

// Logout Controller
exports.logout = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]; // Get token from Authorization header

  try {
    if (!token) return res.status(400).json({ message: 'Token missing' });

    // Delete the session from the database
    await Session.deleteOne({ authToken: token });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ message: 'An error occurred' });
  }
};

// Middleware to Validate Session
exports.validateSession = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Get token from Authorization header

  try {
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    // Find session by token
    const session = await Session.findOne({ authToken: token });

    if (!session || new Date() > session.expiresAt) {
      return res.status(401).json({ message: 'Session expired' });
    }

    // Update last accessed time (optional)
    session.lastAccessedAt = new Date();
    await session.save();

    // Attach userId to the request for downstream use
    req.userId = session.userId;
    next();
  } catch (error) {
    console.error('Error during session validation:', error);
    res.status(500).json({ message: 'An error occurred' });
  }
};
