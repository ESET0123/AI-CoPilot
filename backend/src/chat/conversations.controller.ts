// import { Request, Response } from 'express';
// import { pool } from '../db/pool';

// /* ================= RENAME CONVERSATION ================= */
// export async function renameConversation(req: Request, res: Response) {
//   const { id } = req.params;
//   const { title } = req.body;
//   const userId = req.userId;

//   if (!title || !title.trim()) {
//     return res.status(400).json({ message: 'Title required' });
//   }

//   const result = await pool.query(
//     `
//     UPDATE conversations
//     SET title = $1, updated_at = NOW()
//     WHERE id = $2 AND user_id = $3
//     RETURNING id, title
//     `,
//     [title.trim(), id, userId]
//   );

//   if (result.rowCount === 0) {
//     return res.status(404).json({ message: 'Conversation not found' });
//   }

//   res.json(result.rows[0]);
// }

// /* ================= DELETE CONVERSATION ================= */
// export async function deleteConversation(req: Request, res: Response) {
//   const { id } = req.params;
//   const userId = req.userId;

//   await pool.query(
//     `DELETE FROM conversations WHERE id = $1 AND user_id = $2`,
//     [id, userId]
//   );

//   res.status(204).send();
// }
