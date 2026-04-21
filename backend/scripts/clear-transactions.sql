-- Clear all transactions
DELETE FROM "Transaction";

-- Show remaining count
SELECT COUNT(*) as remaining_transactions FROM "Transaction";
