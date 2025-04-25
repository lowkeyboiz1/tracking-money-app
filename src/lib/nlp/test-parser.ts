import * as parser from "./parser"

// Test function to check if parsing works correctly
function testParseTransaction(input: string, expectedType: "credit" | "debit", expectedAmount: number, expectedCategory?: string) {
  try {
    const result = parser.parseTransaction(input)
    console.log(`✅ Input: "${input}"`)
    console.log(`   Output: type=${result.type}, amount=${result.amount}, category=${result.category}`)

    if (result.type !== expectedType) {
      console.error(`❌ Type mismatch! Expected: ${expectedType}, Got: ${result.type}`)
    }

    if (result.amount !== expectedAmount) {
      console.error(`❌ Amount mismatch! Expected: ${expectedAmount}, Got: ${result.amount}`)
    }

    if (expectedCategory && result.category !== expectedCategory) {
      console.error(`❌ Category mismatch! Expected: ${expectedCategory}, Got: ${result.category}`)
    }

    return true
  } catch (error) {
    console.error(`❌ Error parsing "${input}": ${error instanceof Error ? error.message : "Unknown error"}`)
    return false
  }
}

// Test function to check if the parser correctly identifies income commands
function testIsIncomeCommand(input: string, expected: boolean) {
  const result = parser.isIncomeCommand(parser.normalizeText(input))
  if (result === expected) {
    console.log(`✅ isIncomeCommand correctly ${expected ? "identified" : "rejected"}: "${input}"`)
  } else {
    console.error(`❌ isIncomeCommand failed on: "${input}" - Expected: ${expected}, Got: ${result}`)
  }
}

// Test function to check if the parser correctly identifies expense commands
function testIsExpenseCommand(input: string, expected: boolean) {
  const result = parser.isExpenseCommand(parser.normalizeText(input))
  if (result === expected) {
    console.log(`✅ isExpenseCommand correctly ${expected ? "identified" : "rejected"}: "${input}"`)
  } else {
    console.error(`❌ isExpenseCommand failed on: "${input}" - Expected: ${expected}, Got: ${result}`)
  }
}

// Test function to check amount extraction
function testExtractAmount(input: string, expected: number) {
  try {
    const result = parser.extractAmount(parser.normalizeText(input))
    if (result === expected) {
      console.log(`✅ extractAmount correctly extracted ${expected} from: "${input}"`)
    } else {
      console.error(`❌ extractAmount failed on: "${input}" - Expected: ${expected}, Got: ${result}`)
    }
  } catch (error) {
    console.error(`❌ Error extracting amount from "${input}": ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

// Test function to check category extraction
function testExtractCategory(input: string, expected: string | null) {
  const result = parser.extractCategory(parser.normalizeText(input))
  if (result === expected) {
    console.log(`✅ extractCategory correctly extracted "${expected}" from: "${input}"`)
  } else {
    console.error(`❌ extractCategory failed on: "${input}" - Expected: ${expected}, Got: ${result}`)
  }
}

// Run tests for English commands
console.log("\n=== TESTING ENGLISH COMMANDS ===\n")

// Test income commands
testParseTransaction("I received 100k salary today", "credit", 100000, "Income")
testParseTransaction("Got 50 from mom", "credit", 50, "Income")
testParseTransaction("Earned 1.5M bonus", "credit", 1500000, "Income")

// Test expense commands
testParseTransaction("Spent 25k on breakfast", "debit", 25000, "Food")
testParseTransaction("Bought coffee for 45", "debit", 45, "Food")
testParseTransaction("Paid 120 for taxi", "debit", 120, "Transportation")

// Run tests for Vietnamese commands
console.log("\n=== TESTING VIETNAMESE COMMANDS ===\n")

// Test Vietnamese income commands
testParseTransaction("Nhận lương 5tr", "credit", 5000000, "Income")
testParseTransaction("Mẹ cho 200k", "credit", 200000, "Income")

// Test Vietnamese expense commands
testParseTransaction("Chi 30k cho ăn sáng", "debit", 30000, "Food")
testParseTransaction("Trả tiền xăng 100k", "debit", 100000, "Transportation")

// Test edge cases
console.log("\n=== TESTING EDGE CASES ===\n")
testParseTransaction("100", "credit", 100) // Should default to credit with no clear indicators
testParseTransaction("Spent $50", "debit", 50) // Dollar sign
testParseTransaction("Monthly rent 5.5M", "debit", 5500000, "Bills") // Decimal with M for million

// Run individual function tests
console.log("\n=== TESTING INDIVIDUAL FUNCTIONS ===\n")

// Test isIncomeCommand
testIsIncomeCommand("I received my salary", true)
testIsIncomeCommand("Mom gave me money", true)
testIsIncomeCommand("Spent money on food", false)

// Test isExpenseCommand
testIsExpenseCommand("I spent money", true)
testIsExpenseCommand("Bought new shoes", true)
testIsExpenseCommand("Got salary", false)

// Test extractAmount
testExtractAmount("100k", 100000)
testExtractAmount("1.5M", 1500000)
testExtractAmount("2,000", 2000)

// Test extractCategory
testExtractCategory("lunch", "Food")
testExtractCategory("taxi ride", "Transportation")
testExtractCategory("internet bill", "Bills")
testExtractCategory("just some text", null)

console.log("\n=== TESTS COMPLETED ===\n")
