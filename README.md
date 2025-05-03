# Expense Tracker App

A simple expense tracker application that allows users to upload receipt images, extract data using OCR (Optical Character Recognition), and save expense information to a custom Express backend.

## Features

- Upload and scan receipt images
- OCR to automatically extract amount and date from receipts
- Save expense data to Express backend
- Store receipt images on the server
- View expense history with sorting and filtering

## Technology Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **OCR Engine**: Tesseract.js
- **Backend**: Express.js, Multer for file uploads
- **Database**: In-memory (JSON) for demo purposes

## Setup Instructions

### Local Development Setup

1. Clone this repository
```
git clone https://github.com/your-username/expense-tracker.git
cd expense-tracker
```

2. Install frontend dependencies
```
npm install
```

3. Install backend dependencies
```
cd server
npm install
cd ..
```

4. Start both frontend and backend in development mode
```
npm run dev:all
```

This will start:
- Frontend at http://localhost:3000
- Backend API at http://localhost:3001

## Usage

1. **Adding an Expense**:
   - Upload a receipt image
   - Click "Scan Receipt" to extract data
   - Fill in or correct any fields
   - Click "Save Expense"

2. **Viewing Expenses**:
   - Click "View All Expenses" to see your expense history
   - Sort by clicking on column headers
   - Click on "View" to see the receipt image

## Backend API Endpoints

- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create a new expense (multipart form with receipt image)
- `/uploads/{filename}` - Access uploaded receipt images

