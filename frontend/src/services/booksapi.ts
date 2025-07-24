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
}

export async function getAllBooks(): Promise<Book[]> {
  const res = await api.get<Book[]>(`${process.env.NEXT_PUBLIC_API_URL}/books/`);
  return res.data;
}

export async function createBook(formData: FormData): Promise<Book> {
  const res = await api.post<Book>(
    `${process.env.NEXT_PUBLIC_API_URL}/books/`,
    formData,
  );
  return res.data;
}

// Get a book by ID
export async function getBookById(bookId: string): Promise<Book> {
  const res = await api.get<Book>(`${process.env.NEXT_PUBLIC_API_URL}/books/${bookId}`);
  return res.data;
}

// Get a book file by ID
export async function getBookFile(bookId: string): Promise<Blob> {
  const res = await api.get(`${process.env.NEXT_PUBLIC_API_URL}/books/${bookId}/file`, {
    responseType: "blob"
  });
  return res.data;
}