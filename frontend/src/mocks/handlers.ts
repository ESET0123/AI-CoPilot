import { http, HttpResponse } from 'msw';
import { nanoid } from '@reduxjs/toolkit';

import { users } from './data/users';
// import { chatStore } from './data/chatStore';
// import type { Message } from '../features/chat/types';

/* ================================
   MSW HANDLERS
================================ */

export const handlers = [
  /* ========= REGISTER ========= */
  http.post('/api/register', async ({ request }) => {
    const { name, email, password } = (await request.json()) as {
      name: string;
      email: string;
      password: string;
    };

    const exists = users.some((u) => u.email === email);

    if (exists) {
      return HttpResponse.json(
        { message: 'User already exists' },
        { status: 409 }
      );
    }

    const newUser = {
      id: nanoid(),
      name,
      email,
      password,
      role: 'user',
    };

    users.push(newUser);

    return HttpResponse.json(
      {message: 'User registered successfully'},
        { status: 201 }
    );
  }),

  /* ========= LOGIN ========= */
  http.post('/api/login', async ({ request }) => {
    const { email, password } = (await request.json()) as {
      email: string;
      password: string;
    };

    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      return HttpResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      token: `mock-token-${user.id}`,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
    });
  }),

  /* ========= CHAT ========= */
http.post('/api/chat', async ({ request }) => {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer mock-token-')) {
    return HttpResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }
  const userId = authHeader.replace('Bearer mock-token-', '');

  const userExists = users.some((u) => u.id === userId);
  
  if (!userExists) {
    return HttpResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  const { message } = (await request.json()) as { message: string };

  return HttpResponse.json({
    reply: `You typed: ${message}`,
  });
}),

];
