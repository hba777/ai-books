// context/BookContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { createBook as apiCreateBook, getAllBooks } from "@/services/booksapi";

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
}

const BookContext = createContext<BookContextType | undefined>(undefined);

export const BookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<Book[]>([]);

  const fetchBooks = async () => {
    const res = await getAllBooks();
    setBooks(res);
  };

  const createBook = async (formData: FormData) => {
    await apiCreateBook(formData); // call API
    await fetchBooks();            // auto refresh list
  };

  useEffect(() => {
    fetchBooks(); // fetch on mount
  }, []);

  return (
    <BookContext.Provider value={{ books, fetchBooks, createBook }}>
      {children}
    </BookContext.Provider>
  );
};

export const useBooks = () => {
  const context = useContext(BookContext);
  if (!context) throw new Error("useBooks must be used within BookProvider");
  return context;
};
