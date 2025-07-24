import React, { createContext, useContext, useState, useEffect } from "react";
import { getAllBooks, createBook as apiCreateBook, getBookById, getBookFile } from "../services/booksApi";

interface Book {
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

interface BookContextType {
  books: Book[];
  fetchBooks: () => Promise<void>;
  createBook: (formData: FormData) => Promise<void>;
  getBookById: (bookId: string) => Promise<Book>;
  getBookFile: (bookId: string) => Promise<Blob>;
}

const BookContext = createContext<BookContextType | undefined>(undefined);

export const BookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<Book[]>([]);

  const fetchBooks = async () => {
    const res = await getAllBooks();
    setBooks(res);
  };

  const createBook = async (formData: FormData) => {
    await apiCreateBook(formData);
    await fetchBooks();
  };

  const fetchBookById = async (bookId: string) => {
    return await getBookById(bookId);
  };

  const fetchBookFile = async (bookId: string) => {
    return await getBookFile(bookId);
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  return (
    <BookContext.Provider value={{
      books,
      fetchBooks,
      createBook,
      getBookById: fetchBookById,
      getBookFile: fetchBookFile
    }}>
      {children}
    </BookContext.Provider>
  );
};

export const useBooks = () => {
  const context = useContext(BookContext);
  if (!context) throw new Error("useBooks must be used within BookProvider");
  return context;
}
