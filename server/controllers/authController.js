import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/index.js";

// How many times bcrypt scrambles the password — 10 is the standard
const SALT_ROUNDS = 10;

// Helper that creates a JWT token for a user
// The token contains the user's id and expires in 7 days
const createToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ── Register ──────────────────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim())     return res.status(400).json({ error: "Name is required." });
    if (!email?.trim())    return res.status(400).json({ error: "Email is required." });
    if (!password)         return res.status(400).json({ error: "Password is required." });
    if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters." });

    // Check if email is already registered
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: "An account with that email already exists." });
    }

    // Hash the password before saving — bcrypt does this for us
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Send back a token so the user is immediately logged in after registering
    const token = createToken(user.id);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        // Never send the password back, even hashed
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Login ─────────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim()) return res.status(400).json({ error: "Email is required." });
    if (!password)      return res.status(400).json({ error: "Password is required." });

    // Find the user by email
    const user = await User.findOne({ where: { email } });

    // Use the same vague error for both "email not found" and "wrong password"
    // so we don't reveal which one is wrong (security best practice)
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Compare the submitted password against the stored hash
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = createToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Get current user ──────────────────────────────────────────────
// The frontend can call this to check who is logged in
export const getMe = async (req, res) => {
  try {
    // req.userId is attached by the auth middleware (see next step)
    const user = await User.findByPk(req.userId, {
      attributes: ["id", "name", "email", "createdAt"],
    });

    if (!user) return res.status(404).json({ error: "User not found." });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};