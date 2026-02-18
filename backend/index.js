// Middleware para exigir autenticação
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    return next();
  }
  res.status(401).json({ error: 'Não autenticado' });
}
// Logout seguro
app.post('/api/auth/logout', (req, res) => {
  req.logout(function(err) {
    if (err) return res.status(500).json({ error: 'Erro ao sair' });
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.json({ ok: true });
    });
  });
});
// Rota para obter usuário autenticado (sessão)
app.get('/api/auth/me', (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    const { password, ...userSafe } = req.user;
    userSafe.id = req.user._id;
    return res.json({ user: userSafe });
  }
  res.status(401).json({ error: 'Não autenticado' });
});
import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
dotenv.config();
// Utilitário para gerar hash de senha
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}
// Cadastro de usuário
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Preencha nome, e-mail e senha.' });
    const db = await connectDb();
    const existing = await db.collection('profiles').findOne({ email });
    if (existing) return res.status(400).json({ error: 'Este e-mail já está cadastrado.' });
    const passwordHash = await hashPassword(password);
    const user = {
      name,
      email,
      password: passwordHash,
      avatar: '',
      createdAt: new Date(),
      isAdmin: false
    };
    const result = await db.collection('profiles').insertOne(user);
    const { password: _, ...userSafe } = user;
    userSafe.id = result.insertedId;
    res.json({ user: userSafe });
  } catch (err) {
    console.error('Erro no cadastro:', err);
    res.status(500).json({ error: 'Erro interno ao cadastrar.' });
  }
});

// Login de usuário
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Preencha e-mail e senha.' });
    const db = await connectDb();
    const user = await db.collection('profiles').findOne({ email });
    if (!user) return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
    const valid = await comparePassword(password, user.password);
    if (!valid) return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
    const { password: _, ...userSafe } = user;
    userSafe.id = user._id;
    res.json({ user: userSafe });
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ error: 'Erro interno ao fazer login.' });
  }
});

const app = express();
// Sessão para Passport
if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET não definida nas variáveis de ambiente.');
}
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // true se usar HTTPS
}));
app.use(passport.initialize());
app.use(passport.session());

// Configuração do Passport Google
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_CALLBACK_URL) {
  throw new Error('Google OAuth: variáveis de ambiente obrigatórias não definidas.');
}
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const db = await connectDb();
    let user = await db.collection('profiles').findOne({ email: profile.emails[0].value });
    if (!user) {
      // Cria usuário se não existir
      user = {
        name: profile.displayName,
        email: profile.emails[0].value,
        avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : '',
        createdAt: new Date(),
        isAdmin: false,
        googleId: profile.id
      };
      const result = await db.collection('profiles').insertOne(user);
      user._id = result.insertedId;
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user._id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const db = await connectDb();
    const user = await db.collection('profiles').findOne({ _id: typeof id === 'string' ? new ObjectId(id) : id });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Rota para iniciar login Google
app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Rota de callback do Google
app.get('/api/auth/google/callback', passport.authenticate('google', {
  failureRedirect: process.env.APP_URL + '/?google=fail',
  session: true
}), (req, res) => {
  // Redireciona para o frontend com sucesso
  res.redirect(process.env.APP_URL + '/?google=success');
});
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URL || process.env.MONGODB_URI || 'mongodb://mongo:dYxlExtPZOWCDIqIHOYdHqnuNVbHTmyL@mongodb.railway.internal:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'financassimples';

// Carregar variáveis SMTP do ambiente
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const APP_URL = process.env.APP_URL;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT),
  auth: { user: SMTP_USER, pass: SMTP_PASS },
});

app.use(cors({
  origin: [
    'https://robsonsvicero.net',
    'http://localhost:5173'
  ],
  credentials: true
}));
app.use(express.json());

let db;

async function connectDb() {
  if (!db) {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(MONGODB_DB);
  }
  return db;
}

app.get('/api/data', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.query.userId;
    const db = await connectDb();
    const transactions = await db.collection('transactions').find({ user_id: userId }).toArray();
    const cards = await db.collection('credit_cards').find({ user_id: userId }).toArray();
    const categories = await db.collection('categories').find({ user_id: userId }).toArray();
    const budgets = await db.collection('budgets').find({ user_id: userId }).toArray();
    res.json({ transactions, cards, categories, budgets });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/transactions', ensureAuthenticated, async (req, res) => {
  try {
    const { transactions, userId } = req.body;
    const db = await connectDb();
    const dbPayload = transactions.map(t => ({ ...t, user_id: userId }));
    await db.collection('transactions').insertMany(dbPayload);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Solicitar recuperação de senha
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Informe seu e-mail.' });
    const db = await connectDb();
    const user = await db.collection('profiles').findOne({ email });
    if (!user) return res.status(200).json({ ok: true }); // Não revela se existe
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 30); // 30 min
    await db.collection('password_resets').insertOne({ userId: user.id, token, expires });
    const link = `${APP_URL}/reset-password?token=${token}`;
    await transporter.sendMail({
      from: SMTP_USER,
      to: email,
      subject: 'Recuperação de senha - Finanças$imples',
      html: `<p>Para redefinir sua senha, clique no link abaixo:</p><p><a href="${link}">${link}</a></p><p>Se não foi você, ignore este e-mail.</p>`
    });
    res.json({ ok: true });
  } catch (err) {
    console.error('Erro ao solicitar recuperação de senha:', err);
    res.status(500).json({ error: 'Erro interno ao solicitar recuperação de senha.' });
  }
});

// Redefinir senha
app.post('/api/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: 'Token e nova senha são obrigatórios.' });
    const db = await connectDb();
    const reset = await db.collection('password_resets').findOne({ token });
    if (!reset || reset.expires < new Date()) return res.status(400).json({ error: 'O link de redefinição é inválido ou expirou.' });
    // Atualizar senha com hash
    const passwordHash = await hashPassword(password);
    await db.collection('profiles').updateOne({ id: reset.userId }, { $set: { password: passwordHash } });
    await db.collection('password_resets').deleteOne({ _id: reset._id });
    res.json({ ok: true });
  } catch (err) {
    console.error('Erro ao redefinir senha:', err);
    res.status(500).json({ error: 'Erro interno ao redefinir senha.' });
  }
});

// Adicione outras rotas conforme necessário

app.listen(PORT, () => {
  console.log(`API backend rodando na porta ${PORT}`);
});
