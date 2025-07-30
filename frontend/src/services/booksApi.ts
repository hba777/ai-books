import api from "../lib/api";

export interface Book {
  _id: string;
  doc_name: string;
  author: string;
  date: string;
  category: string;
  reference: string;
  status: string;
  summary: string;
  labels?: string[] | null;    
  startDate?: string | null; 
  endDate?: string | null;
  assigned_departments?: string[];
  feedback?: Feedback[];
}

export interface Feedback {
  user_id: string;
  username: string;
  department: string;
  comment: string;
  timestamp: string;
}


export async function getAllBooks(): Promise<Book[]> {
  const res = await api.get<Book[]>('/books/');
  return res.data;
}

export async function createBook(formData: FormData): Promise<Book> {
  const res = await api.post<Book>(
    '/books/',
    formData,
  );
  return res.data;
}

// Get a book by ID
export async function getBookById(bookId: string): Promise<Book> {
  const res = await api.get<Book>(`/books/${bookId}`);
  return res.data;
}

// Get a book file by ID
export async function getBookFile(bookId: string): Promise<Blob> {
  const res = await api.get(`/books/${bookId}/file`, {
    responseType: "blob"
  });
  return res.data;
}

// Assign book to departments
export async function assignDepartments(bookId: string, departments: string[]): Promise<{ message: string }> {
  const res = await api.put<{ message: string }>(`/books/${bookId}/assign`, departments);
  return res.data;
}

// Add feedback to book
export async function addFeedback(bookId: string, comment: string, department: string): Promise<{ message: string }> {
  const res = await api.post<{ message: string }>(`/books/${bookId}/feedback`, { comment, department });
  return res.data;
}

// Add after other exports
export async function indexBook(bookId: string): Promise<{ message: string; indexed_doc_id: string }> {
  const res = await api.post<{ message: string; indexed_doc_id: string }>(`/chunks/index-book/${bookId}`);
  return res.data;
}
