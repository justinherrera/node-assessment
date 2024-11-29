import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../index';

const prisma = new PrismaClient();

beforeAll(async () => {
  await prisma.$connect();
  await prisma.todo.deleteMany(); 
});

afterAll(async () => {
  await prisma.todo.deleteMany();
  await prisma.$disconnect();
});

describe('Todo API', () => {
  it('should create a new todo with valid data', async () => {
    const res = await request(app).post('/api/todos').send({
      title: 'Test Todo',
      description: 'This is a test todo',
      completed: false
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe('Test Todo');
  });

  it('should fetch all todos', async () => {
    const res = await request(app).get('/api/todos');

    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should update a todo', async () => {
    const todo = await prisma.todo.create({
      data: { title: 'Old Title', description: 'Old Description' },
    });

    const res = await request(app).put(`/api/todos/${todo.id}`).send({
      title: 'Updated Title',
    });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated Title');
  });

  it('should delete a todo', async () => {
    const todo = await prisma.todo.create({
      data: { title: 'Delete Me', description: 'To be deleted' },
    });

    const res = await request(app).delete(`/api/todos/${todo.id}`);

    expect(res.status).toBe(204);

    const deletedTodo = await prisma.todo.findUnique({ where: { id: todo.id } });
    expect(deletedTodo).toBeNull();
  });
});
