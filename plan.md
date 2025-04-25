# Personal Finance Tracking Application with Chatbot Interface

## Overview

A web application for tracking personal finances with natural language input via a chatbot interface. Users can create multiple wallets, log transactions using natural language commands, and manage their finances in an intuitive interface.

## Tech Stack

- **Frontend**: Next.js with React
- **UI Components**: ShadCN
- **State Management**: Jotai for local state
- **API Integration**: React Query (useQuery/useMutation)
- **Chatbot**: Vercel AI SDK (useChat)
- **Backend**: Next.js API routes
- **Database**: MongoDB (direct implementation, no Mongoose)

## Core Features

### 1. Wallet Management

- Create, edit, and delete wallets
- Switch between multiple wallets
- Display wallet balance and transaction history
- Support different currencies (primarily VND)

### 2. Chatbot Interface

- Natural language input for transactions
- Command parsing for different transaction types:
  - Income: "Today I earned 70k" → Add 70,000 VND
  - Expenses: "Spent 50k on breakfast" → Deduct 50,000 VND
- Context awareness (current wallet selection)
- Confirmation responses with updated balances

### 3. Transaction Management

- Record all transactions with metadata:
  - Amount
  - Type (credit/debit)
  - Category (food, transportation, salary, etc.)
  - Date and time
  - Description/notes
- Ability to view, filter, and search transaction history
- Transaction categorization (automatic + manual override)

## Implementation Plan

### Phase 1: Project Setup 🟢 (~1 day)

- [✅] Initialize Next.js project (~30m)
- [✅] Configure MongoDB connection (~1h)
- [✅] Set up ShadCN UI components (~1h)
- [✅] Implement basic file/folder structure (~1h)
- [✅] Set up state management with Jotai (~30m)
- [✅] Configure React Query (~30m)
- [ ] **Authentication Setup (Optional)** 🟡 (~2h):
  - [ ] Implement basic authentication with NextAuth.js
  - [ ] Set up Google OAuth or email/password login
  - [ ] Create protected routes and session management

### Phase 2: Backend Development 🟢 (~2 days)

- [✅] Design database schema for wallets and transactions (~2h)
- [✅] Create API routes (~1d):
  - [✅] Wallet CRUD operations
  - [✅] Transaction operations
  - [✅] User authentication endpoints
- [✅] Set up error handling middleware and validation (~2h)

### Phase 2.5: Chatbot NLP Engine 🟢 (~1.5 days)

- [✅] Implement core NLP functions (~4h):
  - [✅] `parseTransaction()`
  - [✅] `isIncomeCommand()` / `isExpenseCommand()`
  - [✅] `extractAmount()`
  - [✅] `extractCategory()`
- [✅] Build NLP test suite (~2h)
- [✅] Test with sample sentences in Vietnamese and English (~2h)
- [✅] Implement error handling for ambiguous commands (~2h)
- [✅] Optimize for Vietnamese language processing (~2h):
  - [✅] Handle Vietnamese currency notations (đ, VND, k, etc.)
  - [✅] Process Vietnamese diacritics correctly
  - [✅] Support Vietnamese phrasings for money transactions

### Phase 3: Frontend Development 🟢 (~3 days)

- [✅] Create main UI layout with ShadCN (~4h)
- [✅] Implement wallet management UI (~1d):
  - [✅] Build WalletCard component
  - [✅] Create WalletCreationForm
  - [✅] Implement WalletSelector dropdown
  - [✅] Design WalletDetails page
- [✅] Build chatbot interface using Vercel AI SDK (~1d):
  - [✅] Develop ChatInputBox component
  - [✅] Create ChatMessage components (user and system)
  - [✅] Implement chat history display
- [✅] Design transaction history display (~4h):
  - [✅] Build TransactionTable component
  - [✅] Create TransactionFilters component
  - [✅] Implement transaction search functionality
- [✅] Implement reactive components for balance updates (~4h):
  - [✅] Create BalanceDisplay component
  - [✅] Develop TransactionSummary components

### Phase 4: Integration & Testing 🟡 (~2 days)

- [✅] Connect frontend to backend APIs with React Query (~4h)
- [✅] Implement error handling and loading states (~2h)
- [ ] Test natural language understanding accuracy (~4h)
- [ ] Optimize performance (~2h)
- [ ] Add responsive design for mobile devices (~4h)
- [ ] Implement comprehensive testing suite (~1d)

### Phase 5: Demo Data & Deployment 🟡 (~0.5 day)

- [✅] Create seed data script (~2h):
  - [✅] Sample wallets: "Ví tiêu hàng ngày", "Ví tiết kiệm", "Ví đầu tư"
  - [✅] Sample transactions of various types
  - [✅] Multiple categories for visualization testing
- [ ] Deploy to Vercel or similar platform (~2h)
- [ ] Test deployed application (~1h)

## Database Schema

### Wallet Collection

```
{
  _id: ObjectId,
  userId: ObjectId, // if implementing auth
  name: String,
  balance: Number,
  currency: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Transaction Collection

```
{
  _id: ObjectId,
  walletId: ObjectId,
  type: String, // 'credit' or 'debit'
  amount: Number,
  category: String,
  description: String,
  date: Date,
  createdAt: Date
}
```

### User Collection (Optional - for Auth)

```
{
  _id: ObjectId,
  email: String,
  name: String,
  image: String, // for OAuth profile pictures
  createdAt: Date,
  updatedAt: Date
}
```

## Chatbot Command Processing Logic

### NLP Functions

```typescript
// Core parsing functions
function parseTransaction(text: string): ParsedTransaction {
  // Determine if income or expense
  if (isIncomeCommand(text)) {
    return parseIncomeCommand(text)
  } else if (isExpenseCommand(text)) {
    return parseExpenseCommand(text)
  }

  throw new Error("Unknown transaction type")
}

interface ParsedTransaction {
  type: "credit" | "debit"
  amount: number
  category?: string
  description: string
}

// Helper functions
function parseIncomeCommand(text: string): ParsedTransaction {
  // Extract amount: "earned 70k" -> 70000
  const amount = extractAmount(text)
  // Extract category if present
  const category = extractCategory(text) || "Income"

  return {
    type: "credit",
    amount,
    category,
    description: text,
  }
}

function parseExpenseCommand(text: string): ParsedTransaction {
  // Extract amount: "spent 50k" -> 50000
  const amount = extractAmount(text)
  // Extract category: "on breakfast" -> "Food"
  const category = extractCategory(text) || "Miscellaneous"

  return {
    type: "debit",
    amount,
    category,
    description: text,
  }
}

function extractAmount(text: string): number {
  // Regex to match patterns like "50k", "70,000", "1.5M"
  const amountRegex = /(\d+[.,]?\d*)\s*[kKmM]?/
  const match = text.match(amountRegex)

  if (!match) return 0

  let amount = parseFloat(match[1].replace(",", ""))

  // Handle shorthand notations
  if (text.includes("k") || text.includes("K")) {
    amount *= 1000
  } else if (text.includes("m") || text.includes("M")) {
    amount *= 1000000
  }

  return amount
}

function extractCategory(text: string): string | null {
  // Map common terms to categories
  const categoryMap = {
    breakfast: "Food",
    lunch: "Food",
    dinner: "Food",
    taxi: "Transportation",
    uber: "Transportation",
    salary: "Income",
    bonus: "Income",
    // Add more mappings
  }

  // Check if any category keyword exists in the text
  for (const [keyword, category] of Object.entries(categoryMap)) {
    if (text.toLowerCase().includes(keyword)) {
      return category
    }
  }

  return null
}
```

### Command Processing Flow

1. User inputs natural language command
2. Backend parses the command using the NLP functions:
   - Transaction type (income/expense)
   - Amount
   - Category (if specified)
   - Description
3. Backend creates transaction record
4. Backend updates wallet balance
5. Response sent back to user with confirmation and updated balance

## API Route Structure

```
/api/wallets [GET, POST]
/api/wallets/[id] [GET, PATCH, DELETE]
/api/transactions [POST]
/api/transactions?walletId=xxx [GET]
/api/auth/[...nextauth] [GET, POST] (if using NextAuth.js)
/api/chatbot/process [POST] (for processing natural language commands)
```

## UI Components

- Navigation Bar
- Wallet Selection/Creation Panel
- Current Balance Display
- Chatbot Interface
- Transaction History List/Table
- Filtering and Search Controls
- Charts/Graphs for Insights (future enhancement)

## Demo / Seed Data

### Sample Wallets

- "Ví tiêu hàng ngày" (Daily Expenses Wallet) - Balance: 2,000,000 VND
- "Ví tiết kiệm" (Savings Wallet) - Balance: 10,000,000 VND
- "Ví đầu tư" (Investment Wallet) - Balance: 50,000,000 VND

### Sample Transactions

- Credit: "Received salary 15M"
- Credit: "Found 50k on the street"
- Credit: "Mom gave me 500k for groceries"
- Debit: "Spent 35k on breakfast"
- Debit: "Taxi to work 120k"
- Debit: "Lunch with colleagues 150k"
- Debit: "Bought new shoes 800k"

### Sample Categories

- Food
- Transportation
- Shopping
- Entertainment
- Bills
- Income
- Gifts

## Common Challenges & Solutions

### Technical Challenges

- **Challenge**: Double transaction submission if user sends the same message twice
  - **Solution**: Implement transaction idempotency keys and check for duplicate submissions within a time window
- **Challenge**: Vietnamese text normalization for NLP
  - **Solution**: Implement preprocessing function to normalize diacritics and Vietnamese-specific currency notations
- **Challenge**: Performance issues with large transaction history
  - **Solution**: Implement pagination and virtual scrolling for transaction lists, index MongoDB collections properly

### UX Challenges

- **Challenge**: Ambiguous commands from users
  - **Solution**: Implement confirmation step for ambiguous commands, suggest alternatives
- **Challenge**: Users forgetting to specify which wallet to use
  - **Solution**: Keep track of "current active wallet" and provide wallet context in responses
- **Challenge**: Limited screen space on mobile devices
  - **Solution**: Create responsive UI that collapses sections intelligently, implement progressive disclosure

### Data Integrity Challenges

- **Challenge**: Transaction accuracy and consistency across wallets
  - **Solution**: Use MongoDB transactions when updating multiple collections
- **Challenge**: Incorrect amount parsing from natural language
  - **Solution**: Implement robust error checking and confirmation flows for irregular amounts

## Testing & Validation

### API Testing

- [ ] Set up Jest for backend testing
- [ ] Create Postman collection for API endpoints
- [ ] Test all CRUD operations for wallets and transactions
- [ ] Validate error handling and edge cases

### NLP Testing

- [ ] Create test suite for command parsing
- [ ] Test various natural language inputs:
  - [ ] Different formats: "Spent 50k", "I spent 50,000", etc.
  - [ ] Edge cases: Misspellings, ambiguous commands
  - [ ] Vietnamese language commands: "Chi 50k cho bữa sáng"
  - [ ] Invalid inputs: Missing amounts, conflicting information

### Frontend Testing

- [ ] Component testing with React Testing Library
- [ ] Integration tests for form submissions
- [ ] End-to-end tests with Cypress

### Validation Rules

- [ ] Transactions must have valid amounts (positive numbers)
- [ ] Expense transactions cannot exceed wallet balance
- [ ] All transactions must be associated with a valid wallet
- [ ] Date validation for historical transactions
- [ ] Category validation against predefined list (optional)

## Future Enhancements

- Advanced analytics and reporting 🟡
- Budget planning and tracking 🟢
- Recurring transactions 🟡
- Multi-user support 🔴
- Export/import functionality 🟡
- Mobile app version 🔴
- Voice command support 🔴
- Automated categorization using machine learning 🔴
- Integration with banking APIs for automatic transaction import 🔴
