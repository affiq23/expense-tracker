

const express = require('express');
const multer  = require('multer');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');
const { v4: uuidv4 } = require('uuid');

const app  = express();
const port = process.env.PORT || 3001;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniquePrefix}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// In-memory store
let expenses = [];

// GET all expenses
app.get('/api/expenses', (req, res) => {
  res.json(expenses);
});

// POST a new expense with optional receipt
app.post('/api/expenses', upload.single('receipt'), (req, res) => {
  try {
    const { amount, date, category, memo } = req.body;
    const receiptUrl = req.file
      ? `http://localhost:${port}/uploads/${req.file.filename}`
      : null;

    const newExpense = {
      id: uuidv4(),
      amount: parseFloat(amount) || 0,
      date: date || new Date().toISOString(),
      category: category || 'Other',
      memo: memo || '',
      receipt_url: receiptUrl,
      created_at: new Date().toISOString()
    };

    expenses.push(newExpense);
    res.status(201).json(newExpense);
  } catch (err) {
    console.error('Error saving expense:', err);
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`GET  /api/expenses`);
  console.log(`POST /api/expenses`);
  console.log(`GET  /uploads/:filename`);
});
