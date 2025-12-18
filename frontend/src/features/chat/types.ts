export type User = {
  id: number;
  name: string;
  role: 'admin' | 'user';
};
export type Message = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  createdAt: string;
};

export type Conversation = {
  id: string;
  title: string;
  createdAt: string;
};
