import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  listExpenses, getExpenseSummary, createExpense, updateExpense, deleteExpense,
} from '../controllers/expenses.controller.js';

const router = Router({ mergeParams: true });
router.use(requireAuth);

router.get('/', listExpenses);
router.get('/summary', getExpenseSummary);
router.post('/', createExpense);
router.patch('/:expenseId', updateExpense);
router.delete('/:expenseId', deleteExpense);

export default router;
