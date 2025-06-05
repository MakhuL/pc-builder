// === backend/server.js ===
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const app = express();
const PORT = process.env.PORT || 3001;

const pool = require('./db');

const corsOptions = {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// === Email-верифікація ===
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'msepeluk8@gmail.com', // замінити
    pass: 'anxcgiyegsijbvrp',   // замінити
  },
});

function sendVerificationEmail(to, token) {
  const url = `http://localhost:3000/verify?token=${token}`;
  const mailOptions = {
    from: 'msepeluk8@gmail.com',
    to,
    subject: 'Підтвердження реєстрації',
    html: `<p>Для підтвердження перейдіть за посиланням:</p><a href="${url}">${url}</a>`
  };
  return transporter.sendMail(mailOptions);
}

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// === Реєстрація ===
app.post('/register', async (req, res) => {
  const { username, password, email } = req.body;
  try {
    const existing = await pool.query('SELECT * FROM users WHERE username = $1 OR email = $2', [username, email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Користувач з таким іменем або email вже існує' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const token = crypto.randomBytes(32).toString('hex');

    await pool.query(
      'INSERT INTO users (username, password, email, role, verification_token) VALUES ($1, $2, $3, $4, $5)',
      [username, hashedPassword, email, 'client', token]
    );

    await sendVerificationEmail(email, token);

    console.log(`Verification link: http://localhost:3000/verify?token=${token}`);
    res.status(201).json({ message: 'Реєстрація успішна. Перевірте email.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Помилка сервера при реєстрації' });
  }
});

// === Верифікація ===
app.get('/verify', async (req, res) => {
  const { token } = req.query;
  try {
    const result = await pool.query('SELECT * FROM users WHERE verification_token = $1', [token]);
    const user = result.rows[0];
    if (!user) return res.status(400).send('Недійсний токен');
    await pool.query('UPDATE users SET is_verified = true, verification_token = NULL WHERE id = $1', [user.id]);
    res.send('✅ Підтвердження успішне! Тепер можете увійти.');
  } catch (err) {
    console.error(err);
    res.status(500).send('Помилка сервера');
  }
});

// === Вхід ===
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ message: 'Користувача не знайдено' });
    if (user.role !== 'admin' && !user.is_verified) {
  return res.status(401).json({ message: 'Підтвердіть email перед входом' });
}

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(401).json({ message: 'Невірний пароль' });

    return res.json({ role: user.role, username: user.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Помилка сервера при логіні' });
  }
});

// === CRUD по всіх таблицях ===
const tables = ['processors', 'gpus', 'rams', 'storage', 'motherboards', 'psus', 'cases'];
tables.forEach((table) => {
  app.get(`/${table}`, async (req, res) => {
    try {
      const result = await pool.query(`SELECT * FROM ${table}`);
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).send(`Помилка при отриманні ${table}`);
    }
  });

  app.post(`/${table}`, async (req, res) => {
    const fields = Object.keys(req.body);
    const values = Object.values(req.body);
    if (fields.length === 0) return res.status(400).send('Немає полів для додавання');

    const placeholders = fields.map((_, index) => `$${index + 1}`).join(', ');
    try {
      const result = await pool.query(
        `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *`,
        values
      );
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).send(`Помилка при додаванні до ${table}`);
    }
  });

  app.put(`/${table}/:id`, async (req, res) => {
    const { id } = req.params;
    const fields = Object.keys(req.body);
    const values = Object.values(req.body);
    if (fields.length === 0) return res.status(400).send('Немає полів для оновлення');

    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    try {
      const result = await pool.query(
        `UPDATE ${table} SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
        [...values, id]
      );
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).send(`Помилка при оновленні ${table}`);
    }
  });

  app.delete(`/${table}/:id`, async (req, res) => {
    const { id } = req.params;
    try {
      await pool.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
      res.sendStatus(204);
    } catch (err) {
      console.error(err);
      res.status(500).send(`Помилка при видаленні з ${table}`);
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
