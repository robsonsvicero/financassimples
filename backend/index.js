import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'SUA_STRING_MONGODB';
const MONGODB_DB = process.env.MONGODB_DB || 'financassimples';

app.use(cors());
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

app.get('/api/data', async (req, res) => {
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

app.post('/api/transactions', async (req, res) => {
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

// Adicione outras rotas conforme necessário

app.listen(PORT, () => {
  console.log(`API backend rodando na porta ${PORT}`);
});
