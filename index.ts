import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ZodError, z } from 'zod';
import { TodoSchema } from './validation';

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.post('/api/todos', async (req: Request, res: Response): Promise<void> => {
  try {

    const parsedData = TodoSchema.parse(req.body);
    const newTodo = await prisma.todo.create({
      data: parsedData,
    });

    res.status(201).json(newTodo);
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ message: err.errors.map((e) => e.message).join(', ') });
    } else {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
});

app.get('/api/todos', async (req: Request, res: Response): Promise<void> => {
  try {
    const todos = await prisma.todo.findMany();
    res.status(200).json(todos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


app.put('/api/todos/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const parsedData = TodoSchema.partial().parse(req.body);

    const updatedTodo = await prisma.todo.update({
      where: { id: parseInt(id, 10) },
      data: parsedData,
    });

    res.status(200).json(updatedTodo);
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ message: err.errors.map((e) => e.message).join(', ') });
    } else if ((err as any).code === 'P2025') {
      res.status(404).json({ message: 'Todo not found' });
    } else {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
});

app.delete('/api/todos/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    await prisma.todo.delete({
      where: { id: parseInt(id, 10) },
    });
    res.status(204).send();
  } catch (err) {
    if ((err as any).code === 'P2025') {
      res.status(404).json({ message: 'Todo not found' });
    } else {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
