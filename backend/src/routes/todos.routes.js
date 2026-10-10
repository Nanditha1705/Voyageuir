import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { listTodos, createTodo, updateTodo, deleteTodo } from '../controllers/todos.controller.js';

const router = Router({ mergeParams: true });
router.use(requireAuth);

router.get('/', listTodos);
router.post('/', createTodo);
router.patch('/:todoId', updateTodo);
router.delete('/:todoId', deleteTodo);

export default router;
