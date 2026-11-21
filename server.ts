import express from 'express';
import Database from 'better-sqlite3';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// Initialize SQLite database
const db = new Database(path.join(__dirname, 'yashucook.db'));

// Initialize Gemini API
const aiKey = process.env.GEMINI_API_KEY || '';
const gemini = new GoogleGenAI({ apiKey: aiKey });

// Setup database tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    phone TEXT,
    email TEXT,
    avatar TEXT,
    tier TEXT DEFAULT 'Silver Chef',
    followers_count INTEGER DEFAULT 0,
    is_creator INTEGER DEFAULT 0,
    device_id TEXT,
    kyc_name TEXT,
    kyc_pan TEXT,
    ad_free_until DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS videos (
    id TEXT PRIMARY KEY,
    creator_id TEXT,
    title TEXT,
    description TEXT,
    video_url TEXT,
    thumbnail TEXT,
    type TEXT CHECK(type IN ('short', 'long')),
    duration INTEGER,
    ingredients TEXT,
    steps TEXT,
    views INTEGER DEFAULT 0,
    genuine_views INTEGER DEFAULT 0,
    watch_hours REAL DEFAULT 0.0,
    likes INTEGER DEFAULT 0,
    reports_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'approved',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(creator_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS views_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    video_id TEXT,
    user_id TEXT,
    device_id TEXT,
    ip_address TEXT,
    watch_duration INTEGER,
    completed_75 INTEGER DEFAULT 0,
    is_genuine INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS follows (
    follower_id TEXT,
    creator_id TEXT,
    PRIMARY KEY(follower_id, creator_id)
  );

  CREATE TABLE IF NOT EXISTS wallet (
    user_id TEXT PRIMARY KEY,
    balance REAL DEFAULT 0.0,
    total_earned REAL DEFAULT 0.0,
    upi_id TEXT,
    bank_account TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    amount REAL,
    type TEXT,
    description TEXT,
    status TEXT DEFAULT 'completed',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    user_name TEXT,
    user_avatar TEXT,
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    subject TEXT,
    message TEXT,
    status TEXT DEFAULT 'open',
    admin_response TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    video_id TEXT,
    user_id TEXT,
    reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed initial mock data if empty
const userCount = db.prepare('SELECT COUNT(*) as cnt FROM users').get() as { cnt: number };
if (userCount.cnt === 0) {
  const insertUser = db.prepare(`INSERT INTO users (id, name, phone, email, avatar, tier, followers_count, is_creator) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
  insertUser.run('u1', 'Chef Yashu', '9876543210', 'yashu@yashucook.com', 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=200', 'Master Chef', 1420, 1);
  insertUser.run('u2', 'Chef Priya', '9123456789', 'priya@yashucook.com', 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=200', 'Gold Chef', 890, 1);
  insertUser.run('u3', 'Aarav Sharma', '9988776655', 'aarav@gmail.com', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200', 'Silver Chef', 45, 0);

  const insertWallet = db.prepare(`INSERT INTO wallet (user_id, balance, total_earned, upi_id) VALUES (?, ?, ?, ?)`);
  insertWallet.run('u1', 450.50, 1200.00, 'yashu@okhdfcbank');
  insertWallet.run('u2', 185.00, 340.00, 'priya@ybl');
  insertWallet.run('u3', 0.0, 0.0, '');

  const insertVideo = db.prepare(`INSERT INTO videos (id, creator_id, title, description, video_url, thumbnail, type, duration, ingredients, steps, views, genuine_views, watch_hours, likes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  insertVideo.run(
    'v1', 'u1',
    'Crispy Garlic Butter Paneer Tikka in 10 Mins!',
    'Learn how to make restaurant style garlic butter paneer tikka right at home with simple ingredients.',
    'https://assets.mixkit.co/videos/preview/mixkit-chef-cutting-vegetables-in-a-kitchen-43187-large.mp4',
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600',
    'short', 45,
    'Paneer, Garlic, Butter, Kashmiri Chilli, Lemon, Curd',
    '1. Cube the paneer.\n2. Mix curd, spices, and garlic paste.\n3. Pan fry in butter till golden brown.',
    1250, 1100, 15.5, 340
  );
  insertVideo.run(
    'v2', 'u2',
    'Authentic Mumbai Street Style Pav Bhaji Recipe',
    'The secret recipe to velvety smooth bhaji with buttery toasted pav rolls.',
    'https://assets.mixkit.co/videos/preview/mixkit-hands-preparing-food-in-a-kitchen-43186-large.mp4',
    'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600',
    'long', 420,
    'Mixed vegetables, Potatoes, Peas, Butter, Pav Bhaji Masala, Onions, Lemon, Pav bread',
    '1. Boil and mash potatoes, peas, and veggies.\n2. Melt generous butter in a large pan.\n3. Sauté onions, tomatoes, and masala.\n4. Mix mashed veggies and simmer.\n5. Serve hot with buttered pav.',
    5400, 4800, 180.2, 920
  );
  insertVideo.run(
    'v3', 'u1',
    'Healthy Avocado Toast with Poached Egg',
    'Start your morning with high protein, nutrient rich avocado toast.',
    'https://assets.mixkit.co/videos/preview/mixkit-pouring-milk-into-a-glass-43183-large.mp4',
    'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600',
    'short', 30,
    'Bread, Avocado, Egg, Chili flakes, Salt, Olive oil',
    '1. Toast bread slice.\n2. Mash avocado with salt and chili flakes.\n3. Poach egg and place on top.',
    890, 820, 8.1, 150
  );
  insertVideo.run(
    'v4', 'u1',
    'Owner Special: Crispy Golden Veg Spring Rolls',
    'Golden fried spring rolls stuffed with crunchy vegetables and sweet chilli dipping sauce. Uploaded by Owner Chef Yashu.',
    'https://assets.mixkit.co/videos/preview/mixkit-chef-cutting-vegetables-in-a-kitchen-43187-large.mp4',
    'https://images.unsplash.com/photo-1548365328-8c6db32c4d6e?w=600',
    'long', 380,
    'Spring roll wrappers, Cabbage, Carrot, Capsicum, Soy sauce, Garlic, Oil',
    '1. Sauté shredded veggies with soy sauce and garlic.\n2. Wrap tightly in spring roll pastry sheets.\n3. Deep fry until golden brown and crispy.\n4. Serve hot with sweet chilli dip.',
    2150, 1950, 45.2, 510
  );
  insertVideo.run(
    'v5', 'u1',
    'Master Chef Signature: Creamy Makhani Butter Chicken',
    'Tender chicken pieces simmered in a velvety tomato butter gravy with kasuri methi. Owner recommendation.',
    'https://assets.mixkit.co/videos/preview/mixkit-hands-preparing-food-in-a-kitchen-43186-large.mp4',
    'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600',
    'long', 540,
    'Chicken, Butter, Tomatoes, Cashews, Fresh Cream, Ginger garlic paste, Kasuri Methi, Spices',
    '1. Marinate and grill chicken tikka pieces.\n2. Prepare rich tomato and cashew puree.\n3. Simmer in generous butter and cream.\n4. Garnish with crushed kasuri methi.',
    7800, 7200, 290.5, 1420
  );
}

// API Routes
app.post('/api/auth/login', (req, res) => {
  const { identifier } = req.body;
  if (!identifier) {
    return res.status(400).json({ error: 'Identifier (phone or email) is required' });
  }
  res.json({ success: true, message: `OTP sent successfully to ${identifier}`, otpHint: '123456' });
});

app.post('/api/auth/verify', (req, res) => {
  const { identifier, otp, name, device_id } = req.body;
  if (otp !== '123456') {
    return res.status(400).json({ error: 'Invalid OTP. Please enter 123456' });
  }

  let user = db.prepare('SELECT * FROM users WHERE phone = ? OR email = ?').get(identifier, identifier) as any;
  if (!user) {
    if (device_id) {
      const devCount = db.prepare('SELECT COUNT(*) as cnt FROM users WHERE device_id = ?').get(device_id) as { cnt: number };
      if (devCount.cnt >= 2) {
        return res.status(400).json({ error: 'Anti-Fraud Policy: Maximum 2 accounts per Device ID allowed.' });
      }
    }

    const userId = 'u_' + Math.random().toString(36).substring(2, 9);
    const userName = name || (identifier.includes('@') ? identifier.split('@')[0] : `User_${identifier.slice(-4)}`);
    const isEmail = identifier.includes('@');
    db.prepare(`
      INSERT INTO users (id, name, phone, email, avatar, tier, is_creator, device_id)
      VALUES (?, ?, ?, ?, ?, 'Silver Chef', 1, ?)
    `).run(
      userId,
      userName,
      isEmail ? '' : identifier,
      isEmail ? identifier : '',
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
      device_id || 'unknown'
    );
    db.prepare(`INSERT INTO wallet (user_id, balance, total_earned, upi_id) VALUES (?, 0, 0, '')`).run(userId);
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  } else if (device_id && !user.device_id) {
    db.prepare('UPDATE users SET device_id = ? WHERE id = ?').run(device_id, user.id);
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
  }

  res.json({ success: true, user });
});

app.get('/api/users/:id', (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  const wallet = db.prepare('SELECT * FROM wallet WHERE user_id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user, wallet });
});

app.put('/api/users/:id', (req, res) => {
  const { name, upi_id, bank_account, is_creator, kyc_name, kyc_pan } = req.body;
  const userId = req.params.id;

  if (name !== undefined || is_creator !== undefined || kyc_name !== undefined || kyc_pan !== undefined) {
    db.prepare(`
      UPDATE users SET 
        name = COALESCE(?, name), 
        is_creator = COALESCE(?, is_creator),
        kyc_name = COALESCE(?, kyc_name),
        kyc_pan = COALESCE(?, kyc_pan)
      WHERE id = ?
    `).run(name, is_creator, kyc_name, kyc_pan, userId);
  }
  if (upi_id !== undefined || bank_account !== undefined) {
    db.prepare('UPDATE wallet SET upi_id = COALESCE(?, upi_id), bank_account = COALESCE(?, bank_account) WHERE user_id = ?').run(upi_id, bank_account, userId);
  }

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  const wallet = db.prepare('SELECT * FROM wallet WHERE user_id = ?').get(userId);
  res.json({ success: true, user, wallet });
});

app.delete('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  db.prepare('DELETE FROM wallet WHERE user_id = ?').run(userId);
  db.prepare('DELETE FROM follows WHERE follower_id = ? OR creator_id = ?').run(userId, userId);
  db.prepare('DELETE FROM videos WHERE creator_id = ?').run(userId);
  db.prepare('DELETE FROM users WHERE id = ?').run(userId);
  res.json({ success: true, message: 'Account deleted successfully' });
});

app.get('/api/videos', (req, res) => {
  const type = req.query.type;
  let query = `
    SELECT v.*, u.name as creator_name, u.avatar as creator_avatar, u.tier as creator_tier, u.followers_count
    FROM videos v
    JOIN users u ON v.creator_id = u.id
    WHERE v.status = 'approved'
  `;
  const params: any[] = [];
  if (type) {
    query += ` AND v.type = ?`;
    params.push(type);
  }
  query += ` ORDER BY v.created_at DESC`;
  const videos = db.prepare(query).all(...params);
  res.json({ videos });
});

app.get('/api/videos/:id', (req, res) => {
  const video = db.prepare(`
    SELECT v.*, u.name as creator_name, u.avatar as creator_avatar, u.tier as creator_tier, u.followers_count
    FROM videos v
    JOIN users u ON v.creator_id = u.id
    WHERE v.id = ?
  `).get(req.params.id);
  if (!video) return res.status(404).json({ error: 'Video not found' });
  res.json({ video });
});

app.post('/api/videos', async (req, res) => {
  const { creator_id, title, description, video_url, thumbnail, type, duration, ingredients, steps, file_size_mb } = req.body;

  if (!creator_id || !title || !video_url) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const durNum = Number(duration) || 30;
  const sizeMb = Number(file_size_mb) || 15;

  if (type === 'short') {
    if (durNum > 60) return res.status(400).json({ error: 'Short videos must be max 1 minute (60 seconds)' });
    if (sizeMb > 30) return res.status(400).json({ error: 'Upload Limit Exceeded: Short videos must be max 30MB.' });
  } else {
    if (durNum > 900) return res.status(400).json({ error: 'Long videos must be max 15 minutes (900 seconds)' });
    if (sizeMb > 150) return res.status(400).json({ error: 'Upload Limit Exceeded: Long videos must be max 150MB.' });
  }

  const coverThumbnail = thumbnail || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600';

  let status = 'approved';
  try {
    if (aiKey) {
      const prompt = `Analyze this recipe upload title and description to check if it is strictly about cooking, food, recipes, or culinary arts. Answer with JSON format: {"is_food": true/false, "reason": "..."} Title: "${title}". Description: "${description}".`;
      const response = await gemini.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      const text = response.text || '';
      if (text.includes('false')) {
        status = 'rejected';
        return res.status(400).json({ error: 'AI Content Filter Rejected: Content must be strictly relevant to cooking and food recipes.' });
      }
    }
  } catch (err) {
    console.error('Gemini content filter error:', err);
  }

  const videoId = 'v_' + Math.random().toString(36).substring(2, 9);
  db.prepare(`
    INSERT INTO videos (id, creator_id, title, description, video_url, thumbnail, type, duration, ingredients, steps, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(videoId, creator_id, title, description, video_url, coverThumbnail, type || 'short', durNum, ingredients, steps, status);

  const newVideo = db.prepare('SELECT * FROM videos WHERE id = ?').get(videoId);
  res.json({ success: true, video: newVideo });
});

app.post('/api/videos/:id/watch', (req, res) => {
  const videoId = req.params.id;
  const { user_id, device_id, ip_address, watch_duration } = req.body;
  const durationNum = Number(watch_duration) || 0;

  const video = db.prepare('SELECT * FROM videos WHERE id = ?').get(videoId) as any;
  if (!video) return res.status(404).json({ error: 'Video not found' });

  let isGenuine = 1;
  if (user_id && user_id === video.creator_id) {
    const creatorViewsCount = db.prepare('SELECT COUNT(*) as cnt FROM views_log WHERE video_id = ? AND user_id = ?').get(videoId, user_id) as { cnt: number };
    if (creatorViewsCount.cnt >= 1) {
      isGenuine = 0;
    }
  }

  // Strict Device Anti-Fraud: block monetization earnings for views coming from accounts sharing the same Device ID as the creator
  if (device_id) {
    const creatorUser = db.prepare('SELECT device_id FROM users WHERE id = ?').get(video.creator_id) as { device_id: string };
    if (creatorUser && creatorUser.device_id && creatorUser.device_id === device_id) {
      isGenuine = 0;
    }
  }

  const completed75 = durationNum >= (video.duration * 0.75) ? 1 : 0;
  if (completed75 === 0) {
    isGenuine = 0;
  }

  if (device_id || ip_address) {
    const recentView = db.prepare(`
      SELECT COUNT(*) as cnt FROM views_log 
      WHERE video_id = ? AND (device_id = ? OR ip_address = ?) 
      AND created_at >= datetime('now', '-60 seconds')
    `).get(videoId, device_id || '', ip_address || '') as { cnt: number };
    if (recentView.cnt > 0) {
      isGenuine = 0;
    }
  }

  db.prepare(`
    INSERT INTO views_log (video_id, user_id, device_id, ip_address, watch_duration, completed_75, is_genuine)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(videoId, user_id || 'guest', device_id || 'unknown', ip_address || '127.0.0.1', durationNum, completed75, isGenuine);

  db.prepare('UPDATE videos SET views = views + 1, watch_hours = watch_hours + ? WHERE id = ?').run(durationNum / 3600, videoId);
  if (isGenuine) {
    db.prepare('UPDATE videos SET genuine_views = genuine_views + 1 WHERE id = ?').run(videoId);

    const creatorStats = db.prepare(`
      SELECT SUM(v.genuine_views) as total_gen_views, SUM(v.watch_hours) as total_watch_hours
      FROM videos v WHERE v.creator_id = ?
    `).get(video.creator_id) as { total_gen_views: number, total_watch_hours: number };

    if (creatorStats.total_gen_views >= 500 && creatorStats.total_watch_hours >= 2.0) {
      const earningsIncrement = video.type === 'short' ? 5 / 1000 : 10 / 1000;
      db.prepare('UPDATE wallet SET balance = balance + ?, total_earned = total_earned + ? WHERE user_id = ?').run(earningsIncrement, earningsIncrement, video.creator_id);
    }
  }

  res.json({ success: true, isGenuine, completed75 });
});

app.post('/api/videos/:id/report', (req, res) => {
  const videoId = req.params.id;
  const { user_id, reason } = req.body;
  const reportId = 'rep_' + Math.random().toString(36).substring(2, 9);

  db.prepare('INSERT INTO reports (id, video_id, user_id, reason) VALUES (?, ?, ?, ?)').run(reportId, videoId, user_id || 'guest', reason || 'Stolen or plagiarized content');
  db.prepare('UPDATE videos SET reports_count = reports_count + 1 WHERE id = ?').run(videoId);

  res.json({ success: true, message: 'Video reported successfully. Our moderation team will review within 24 hours.' });
});

app.post('/api/creators/:id/follow', (req, res) => {
  const creatorId = req.params.id;
  const { follower_id } = req.body;
  if (!follower_id) return res.status(400).json({ error: 'Follower ID required' });

  const existing = db.prepare('SELECT * FROM follows WHERE follower_id = ? AND creator_id = ?').get(follower_id, creatorId);
  if (existing) {
    db.prepare('DELETE FROM follows WHERE follower_id = ? AND creator_id = ?').run(follower_id, creatorId);
    db.prepare('UPDATE users SET followers_count = MAX(0, followers_count - 1) WHERE id = ?').run(creatorId);
    res.json({ success: true, following: false });
  } else {
    db.prepare('INSERT INTO follows (follower_id, creator_id) VALUES (?, ?)').run(follower_id, creatorId);
    db.prepare('UPDATE users SET followers_count = followers_count + 1 WHERE id = ?').run(creatorId);
    res.json({ success: true, following: true });
  }
});

app.post('/api/ai/fridge-cook', async (req, res) => {
  const { ingredients } = req.body;
  if (!ingredients) return res.status(400).json({ error: 'Ingredients list is required' });

  try {
    if (!aiKey) {
      return res.json({
        recipe: {
          title: `Quick ${ingredients} Stir Fry`,
          description: `A delicious recipe crafted using your available ingredients: ${ingredients}.`,
          ingredients: ingredients.split(',').map((i: string) => i.trim()),
          steps: ['Prep ingredients', 'Heat pan with oil', 'Sauté together with spices', 'Serve hot'],
          cookingTime: '15 mins'
        }
      });
    }

    const prompt = `Given these ingredients available in the fridge: "${ingredients}", generate a matching delicious recipe in JSON format with keys: title, description, ingredients (array), steps (array of strings), cookingTime.`;
    const response = await gemini.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const data = JSON.parse(response.text || '{}');
    res.json({ recipe: data });
  } catch (err) {
    console.error('AI Fridge Cook error:', err);
    res.status(500).json({ error: 'Failed to generate recipe from fridge ingredients' });
  }
});

app.post('/api/wallet/withdraw', (req, res) => {
  const { user_id, amount, upi_id } = req.body;
  const withdrawAmount = Number(amount) || 0;

  if (withdrawAmount < 159) {
    return res.status(400).json({ error: 'Minimum payout threshold is strictly ₹159' });
  }

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(user_id) as any;
  if (!user || !user.kyc_name || !user.kyc_pan) {
    return res.status(400).json({ error: 'KYC Verification Required: Please fill out your Full Legal Name and PAN Card Number in Wallet settings before withdrawal.' });
  }

  const wallet = db.prepare('SELECT * FROM wallet WHERE user_id = ?').get(user_id) as any;
  if (!wallet || wallet.balance < withdrawAmount) {
    return res.status(400).json({ error: 'Insufficient wallet balance' });
  }

  db.prepare('UPDATE wallet SET balance = balance - ? WHERE user_id = ?').run(withdrawAmount, user_id);
  const txId = 'tx_' + Math.random().toString(36).substring(2, 9);
  db.prepare('INSERT INTO transactions (id, user_id, amount, type, description) VALUES (?, ?, ?, ?, ?)').run(
    txId, user_id, withdrawAmount, 'debit', `Payout to UPI: ${upi_id || wallet.upi_id}`
  );

  res.json({ success: true, message: `Withdrawal of ₹${withdrawAmount} initiated successfully to ${upi_id || wallet.upi_id}` });
});

app.get('/api/wallet/:user_id/transactions', (req, res) => {
  const txs = db.prepare('SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC').all(req.params.user_id);
  res.json({ transactions: txs });
});

app.get('/api/creators/:id/dashboard', (req, res) => {
  const creatorId = req.params.id;
  const videos = db.prepare('SELECT * FROM videos WHERE creator_id = ? ORDER BY created_at DESC').all(creatorId) as any[];
  
  const stats = db.prepare(`
    SELECT 
      COALESCE(SUM(views), 0) as total_views,
      COALESCE(SUM(genuine_views), 0) as total_genuine_views,
      COALESCE(SUM(watch_hours), 0.0) as total_watch_hours,
      COALESCE(SUM(likes), 0) as total_likes,
      COALESCE(SUM(CASE WHEN type = 'short' THEN genuine_views ELSE 0 END), 0) as short_genuine_views,
      COALESCE(SUM(CASE WHEN type = 'long' THEN genuine_views ELSE 0 END), 0) as long_genuine_views
    FROM videos WHERE creator_id = ?
  `).get(creatorId) as any;

  const wallet = db.prepare('SELECT * FROM wallet WHERE user_id = ?').get(creatorId);
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(creatorId) as any;

  const isMonetized = stats.total_genuine_views >= 500 && stats.total_watch_hours >= 2.0;

  res.json({ videos, stats, wallet, user, isMonetized });
});

app.get('/api/chat', (req, res) => {
  const messages = db.prepare('SELECT * FROM chat_messages ORDER BY created_at DESC LIMIT 50').all();
  res.json({ messages: messages.reverse() });
});

app.post('/api/chat', (req, res) => {
  const { user_id, user_name, user_avatar, message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });

  const msgId = 'msg_' + Math.random().toString(36).substring(2, 9);
  db.prepare('INSERT INTO chat_messages (id, user_id, user_name, user_avatar, message) VALUES (?, ?, ?, ?, ?)').run(
    msgId, user_id || 'guest', user_name || 'Foodie', user_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200', message
  );

  const newMsg = db.prepare('SELECT * FROM chat_messages WHERE id = ?').get(msgId);
  res.json({ success: true, message: newMsg });
});

app.get('/api/tickets/:user_id', (req, res) => {
  const tickets = db.prepare('SELECT * FROM tickets WHERE user_id = ? ORDER BY created_at DESC').all(req.params.user_id);
  res.json({ tickets });
});

app.post('/api/tickets', (req, res) => {
  const { user_id, subject, message } = req.body;
  if (!subject || !message) return res.status(400).json({ error: 'Subject and message are required' });

  const ticketId = 'tkt_' + Math.random().toString(36).substring(2, 9);
  db.prepare('INSERT INTO tickets (id, user_id, subject, message, status, admin_response) VALUES (?, ?, ?, ?, ?, ?)').run(
    ticketId, user_id, subject, message, 'open', 'Our support team has received your request. Expect a response within 24-48 hours.'
  );

  const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(ticketId);
  res.json({ success: true, ticket });
});

if (process.env.NODE_ENV !== 'production') {
  import('vite').then(async ({ createServer }) => {
    const vite = await createServer({
      server: { middlewareMode: true }
    });
    app.use(vite.middlewares);
    app.listen(PORT, () => {
      console.log(`Yashucook server running on http://localhost:${PORT}`);
    });
  });
} else {
  app.listen(PORT, () => {
    console.log(`Yashucook production server running on port ${PORT}`);
  });
}
