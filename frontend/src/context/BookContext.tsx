import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { 
  getAllBooks, 
  createBook as apiCreateBook, 
  getBookById, 
  getBookFile,
  assignDepartments as apiAssignDepartments,
  assignSingleDepartment as apiAssignSingleDepartment,
  addFeedback as apiAddFeedback,
  indexBook as apiIndexBook,
  startClassification as apiStartClassification,
  connectToProgressWebSocket,
  connectToIndexProgressWebSocket,
  Book,
  ClassificationProgress,
  getReviewOutcomes,
  ReviewOutcomesResponse,
  getBookClassifications,
  BookClassificationsResponse,
  updateReviewOutcome,
  deleteReviewOutcome,
  ReviewUpdateRequest,
  ReviewUpdateResponse,
  ReviewDeleteResponse
} from "../services/booksApi"
import { useUser } from "../context/UserContext";

interface BookContextType {
  books: Book[];
  activeClassifications: ClassificationProgress[];
  fetchBooks: () => Promise<void>;
  createBook: (formData: FormData) => Promise<void>;
  getBookById: (bookId: string) => Promise<Book>;
  getBookFile: (bookId: string) => Promise<Blob>;
  assignDepartments: (bookId: string, departments: string[]) => Promise<void>;
  assignSingleDepartment: (bookId: string, department: string) => Promise<void>;
  addFeedback: (bookId: string, department: string, comment?: string, image?: string) => Promise<void>;
  indexBook: (bookId: string) => Promise<void>;
  startClassification: (bookId: string) => Promise<void>;
  getBookNameById: (bookId: string) => string | undefined;
  reviewOutcomes: ReviewOutcomesResponse[];
  fetchReviewOutcomes: () => Promise<void>;
  getBookClassifications: (bookId: string) => Promise<BookClassificationsResponse>;
  updateReviewOutcome: (outcomeId: string, reviewType: string, data: ReviewUpdateRequest) => Promise<ReviewUpdateResponse>;
  deleteReviewOutcome: (outcomeId: string, reviewType: string) => Promise<ReviewDeleteResponse>;
}

const BookContext = createContext<BookContextType | undefined>(undefined);

export const BookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [activeClassifications, setActiveClassifications] = useState<ClassificationProgress[]>([]);
  const [reviewOutcomes, setReviewOutcomes] = useState<ReviewOutcomesResponse[]>([]);
  const classificationsCacheRef = useRef<Map<string, BookClassificationsResponse>>(new Map());
  const { user, loading: userLoading } = useUser(); 
  const websocketRefs = useRef<Map<string, WebSocket>>(new Map());
  const wsRef = useRef<WebSocket | null>(null);

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

  const assignSingleDepartment = async (bookId: string, department: string) => {
    await apiAssignSingleDepartment(bookId, department);
    await fetchBooks(); // Refresh books to get updated data
  };

  const addFeedback = async (bookId: string, department: string, comment?: string, image?: string) => {
    await apiAddFeedback(bookId, department, comment, image);
    await fetchBooks(); // Refresh books to get updated data
  };

  const indexBook = async (bookId: string) => {
    await apiIndexBook(bookId);
    fetchBooks();
    wsRef.current = connectToIndexProgressWebSocket(bookId, () => {
    console.log("Triggered");
    fetchBooks(); // this should work now
  });
  };

  const getBookNameById = (bookId: string): string | undefined => {
    const book = books.find(b => b._id === bookId);
    return book?.doc_name;
  };

  const startClassification = async (bookId: string) => {
    try {
      await apiStartClassification(bookId);
      await fetchBooks(); // Refresh books to get updated data
      
      // Add to active classifications
      const bookName = getBookNameById(bookId);
      const newClassification: ClassificationProgress = {
        book_id: bookId,
        progress: 0,
        total: undefined,
        done: undefined,
        book_name: bookName
      };
      
      setActiveClassifications(prev => [...prev, newClassification]);
      
      // Connect to WebSocket for progress updates
      const ws = connectToProgressWebSocket(bookId, (progress: number, total?: number, done?: number, rawData?: any) => {
        setActiveClassifications(prev => 
          prev.map(classification => 
            classification.book_id === bookId 
              ? { ...classification, progress, total, done }
              : classification
          )
        );
        
        // If progress is 100%, remove from active classifications after a delay
        if (progress === 100) {
          fetchBooks()
          setTimeout(() => {
            setActiveClassifications(prev => 
              prev.filter(classification => classification.book_id !== bookId)
            );
            // Close WebSocket connection
            const wsToClose = websocketRefs.current.get(bookId);
            if (wsToClose) {
              wsToClose.close();
              websocketRefs.current.delete(bookId);
            }
          }, 2000); // Remove after 2 seconds
        }
      });
      
      websocketRefs.current.set(bookId, ws);
      
    } catch (error) {
      console.error('Error starting classification:', error);
    }
  };

  const fetchReviewOutcomes = async () => {
    const res = await getReviewOutcomes();
    setReviewOutcomes(res);
  };

  const fetchBookClassifications = async (bookId: string): Promise<BookClassificationsResponse> => {
    const cached = classificationsCacheRef.current.get(bookId);
    if (cached) return cached;
    const res = await getBookClassifications(bookId);
    classificationsCacheRef.current.set(bookId, res);
    return res;
  };

  const updateReviewOutcomeHandler = async (outcomeId: string, reviewType: string, data: ReviewUpdateRequest): Promise<ReviewUpdateResponse> => {
    return await updateReviewOutcome(outcomeId, reviewType, data);
  };

  const deleteReviewOutcomeHandler = async (outcomeId: string, reviewType: string): Promise<ReviewDeleteResponse> => {
    return await deleteReviewOutcome(outcomeId, reviewType);
  };

  // Cleanup WebSocket connections on unmount
  useEffect(() => {
    return () => {
      websocketRefs.current.forEach((ws) => {
        ws.close();
      });
      websocketRefs.current.clear();
    };
  }, []);

  useEffect(() => {
    if (!userLoading && user) {
      fetchBooks();
    } else if (!userLoading && !user) {
      setBooks([]); // clear if logged out
      setActiveClassifications([]); // clear active classifications
    }
  }, [user, userLoading]);

  return (
    <BookContext.Provider value={{
      books,
      activeClassifications,
      fetchBooks,
      createBook,
      getBookById: fetchBookById,
      getBookFile: fetchBookFile,
      assignDepartments,
      assignSingleDepartment,
      addFeedback,
      indexBook,
      startClassification,
      getBookNameById,
      reviewOutcomes,
      fetchReviewOutcomes,
      getBookClassifications: fetchBookClassifications,
      updateReviewOutcome: updateReviewOutcomeHandler,
      deleteReviewOutcome: deleteReviewOutcomeHandler
    }}>
      {children}
    </BookContext.Provider>
  );
};

export type { ReviewOutcomesResponse };

export const useBooks = () => {
  const context = useContext(BookContext);
  if (!context) throw new Error("useBooks must be used within BookProvider");
  return context;
}
