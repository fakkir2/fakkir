export type Task = {
  id: string;
  title: string;
  /** Local date in YYYY-MM-DD format */
  date: string;
  done: boolean;
};

export type Note = {
  id: string;
  title: string;
  body: string;
  updatedAt: number;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
};

export type Conversation = {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: number;
};

export type Profile = {
  name: string;
  email: string;
  university: string;
};
