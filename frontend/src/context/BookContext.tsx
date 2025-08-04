import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  getAllBooks, 
  createBook as apiCreateBook, 
  getBookById, 
  getBookFile,
  assignDepartments as apiAssignDepartments,
  addFeedback as apiAddFeedback,
  startClassification as apiStartClassification,
  Book,

} from "../services/booksApi"
import { useUser } from "../context/UserContext";

interface BookContextType {
  books: Book[];
  fetchBooks: () => Promise<void>;
  createBook: (formData: FormData) => Promise<void>;
  getBookById: (bookId: string) => Promise<Book>;
  getBookFile: (bookId: string) => Promise<Blob>;
  assignDepartments: (bookId: string, departments: string[]) => Promise<void>;
  addFeedback: (bookId: string, comment: string, department: string) => Promise<void>;
  startClassification: (bookId: string) => Promise<void>;
}

const BookContext = createContext<BookContextType | undefined>(undefined);

export const BookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const { user, loading: userLoading } = useUser(); 

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

  const assignDepartments = async (bookId: string, departments: string[]) => {
    await apiAssignDepartments(bookId, departments);
    await fetchBooks(); // Refresh books to get updated data
  };

  const addFeedback = async (bookId: string, comment: string, department: string) => {
    await apiAddFeedback(bookId, comment, department);
    await fetchBooks(); // Refresh books to get updated data
  };

  const startClassification = async (bookId: string) => {
    await apiStartClassification(bookId);
    await fetchBooks(); // Refresh books to get updated data
  };


  useEffect(() => {
    if (!userLoading && user) {
      fetchBooks();
    } else if (!userLoading && !user) {
      setBooks([]); // clear if logged out
    }
  }, [user, userLoading]);

  return (
    <BookContext.Provider value={{
      books,
      fetchBooks,
      createBook,
      getBookById: fetchBookById,
      getBookFile: fetchBookFile,
      assignDepartments,
      addFeedback,
      startClassification,
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
