import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const {
  MONGODB_URI,
  MONGODB_DB,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  APP_URL
} = process.env;

if (!MONGODB_URI || !MONGODB_DB || !SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !APP_URL) {
  throw new Error('Variáveis de ambiente faltando. Verifique o .env.');
}

const mongoClient = new MongoClient(MONGODB_URI);
let db;

async function connectDb() {
  if (!db) {
    await mongoClient.connect();
    db = mongoClient.db(MONGODB_DB);
  }
  return db;
}

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT),
  auth: { user: SMTP_USER, pass: SMTP_PASS },
});

// Solicitar recuperação de senha
app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'E-mail obrigatório.' });
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
});

// Redefinir senha
app.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: 'Token e nova senha obrigatórios.' });
  const db = await connectDb();
  const reset = await db.collection('password_resets').findOne({ token });
  if (!reset || reset.expires < new Date()) return res.status(400).json({ error: 'Token inválido ou expirado.' });
  await db.collection('profiles').updateOne({ id: reset.userId }, { $set: { password } });
  await db.collection('password_resets').deleteOne({ _id: reset._id });
  res.json({ ok: true });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Password recovery backend running on port ${PORT}`));
