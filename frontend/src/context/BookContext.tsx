import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { 
  getAllBooks, 
  createBook as apiCreateBook, 
  getBookById, 
  getBookFile,
  assignSingleDepartment as apiAssignSingleDepartment,
  addFeedback as apiAddFeedback,
  indexBook as apiIndexBook,
  startClassification as apiStartClassification,
  connectToProgressWebSocket,
  connectToIndexProgressWebSocket,
  connectToAnalysisProgressWebSocket,
  Book,
  ClassificationProgress,
  AnalysisProgress,
  getReviewOutcomes,
  ReviewOutcomesResponse,
  getBookClassifications, 
  BookClassificationsResponse,
  updateReviewOutcome,
  deleteReviewOutcome,
  ReviewUpdateRequest,
  ReviewUpdateResponse,
  ReviewDeleteResponse,
  updateBook as apiUpdateBook,
  removeClassificationFromChunk as apiRemoveClassificationFromChunk,
  updateClassificationFilter as apiUpdateClassificationFilter,
  updateAnalysisFilters as apiUpdateAnalysisFilters
} from "../services/booksApi"
import { useUser } from "../context/UserContext";
import { toast } from "react-toastify";

interface BookContextType {
  books: Book[];
  activeClassifications: ClassificationProgress[];
  activeAnalyses: AnalysisProgress[];
  fetchBooks: () => Promise<void>;
  createBook: (formData: FormData) => Promise<void>;
  getBookById: (bookId: string) => Promise<Book>;
  getBookFile: (bookId: string) => Promise<Blob>;
  assignSingleDepartment: (bookId: string, department: string) => Promise<void>;
  addFeedback: (bookId: string, department: string, comment?: string, image?: string) => Promise<void>;
  indexBook: (bookId: string, chunkSize?: number) => Promise<void>;
  startClassification: (bookId: string, runClassification?: boolean, runAnalysis?: boolean) => Promise<void>;
  getBookNameById: (bookId: string) => string | undefined;
  reviewOutcomes: ReviewOutcomesResponse[];
  fetchReviewOutcomes: () => Promise<void>;
  getBookClassifications: (bookId: string) => Promise<BookClassificationsResponse>;
  updateReviewOutcome: (outcomeId: string, reviewType: string, data: ReviewUpdateRequest) => Promise<ReviewUpdateResponse>;
  deleteReviewOutcome: (outcomeId: string, reviewType: string) => Promise<ReviewDeleteResponse>;
  updateBook: (bookId: string, data: Partial<Book>) => Promise<void>;
  removeClassificationFromChunk: (chunkId: string, label: string) => Promise<void>;
  jumpToClassificationCoordinates: (coordinates: number[], pageNumber: number) => void;
  updateClassificationFilter: (bookId: string, name: string, value: number) => Promise<void>;
  updateAnalysisFilters: (bookId: string, analysisFilters?: string[], analysisConfidence?: number) => Promise<void>;
}

const BookContext = createContext<BookContextType | undefined>(undefined);

export const BookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [activeClassifications, setActiveClassifications] = useState<ClassificationProgress[]>(() => {
    // Load from localStorage on initial render
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('activeClassifications');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [activeAnalyses, setActiveAnalyses] = useState<AnalysisProgress[]>(() => {
    // Load from localStorage on initial render
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('activeAnalyses');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
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

  const assignSingleDepartment = async (bookId: string, department: string) => {
    await apiAssignSingleDepartment(bookId, department);
    await fetchBooks(); // Refresh books to get updated data
  };

  const addFeedback = async (bookId: string, department: string, comment?: string, image?: string) => {
    await apiAddFeedback(bookId, department, comment, image);
    await fetchBooks(); // Refresh books to get updated data
  };

  const indexBook = async (bookId: string, chunkSize?: number) => {
    try {
      await apiIndexBook(bookId, chunkSize ?? 1000);
      fetchBooks();

      let pollId: number | undefined;
      const stopPolling = () => {
        if (pollId !== undefined) {
          clearInterval(pollId);
          pollId = undefined;
        }
      };

      // Start polling as a fallback in case WS doesn't emit
      if (typeof window !== 'undefined') {
        pollId = window.setInterval(async () => {
          try {
            const latest = await getBookById(bookId);
            // If status moved out of Indexing/Processing, stop and refresh
            if (latest.status !== 'Indexing' && latest.status !== 'Processing') {
              stopPolling();
              await fetchBooks();
              if (latest.status !== 'Processed') {
                toast.error('Indexing failed or was reverted.');
              }
            }
          } catch (e) {
            // On polling error, stop and refresh
            stopPolling();
            await fetchBooks();
          }
        }, 4000);
      }

      wsRef.current = connectToIndexProgressWebSocket(bookId, async () => {
        console.log("Triggered");
        stopPolling();
        await fetchBooks(); // this should work now
      }, async (evt: any) => {
        // Error or unexpected close: show toast and refresh
        stopPolling();
        toast.error('Indexing encountered an error. Status reverted if needed.');
        await fetchBooks();
      });
    } catch (error: any) {
      const detail = error?.response?.data?.detail || error?.message || 'Failed to start indexing';
      toast.error(`Indexing failed: ${detail}`);
      // Ensure UI refresh to pick latest book status from backend
      fetchBooks();
      throw error;
    }
  };

  const getBookNameById = (bookId: string): string | undefined => {
    const book = books.find(b => b._id === bookId);
    return book?.doc_name;
  };

  const startClassification = async (bookId: string, runClassification: boolean = true, runAnalysis: boolean = true) => {
    try {
      await apiStartClassification(bookId, runClassification, runAnalysis);
      await fetchBooks(); // Refresh books to get updated data
      
      // Add to active classifications if running classification
      if (runClassification) {
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
      }

      // Connect to Analysis progress if running analysis
      if (runAnalysis) {
        const analysisWs = connectToAnalysisProgressWebSocket(bookId, (progress: number, total?: number, done?: number) => {
          setActiveAnalyses(prev => {
            const bookName = getBookNameById(bookId);
            const existing = prev.find(a => a.book_id === bookId);
            const updated = { book_id: bookId, progress, total, done, book_name: bookName } as AnalysisProgress;
            if (existing) {
              return prev.map(a => a.book_id === bookId ? updated : a);
            }
            return [...prev, updated];
          });
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
            setTimeout(() => {
              setActiveAnalyses(prev => prev.filter(a => a.book_id !== bookId));
              const wsToClose = websocketRefs.current.get(`${bookId}-analysis`);
              if (wsToClose) {
                wsToClose.close();
                websocketRefs.current.delete(`${bookId}-analysis`);
              }
            }, 2000);
          }
        });
        websocketRefs.current.set(`${bookId}-analysis`, analysisWs);
      }
      
    } catch (error: any) {
      const detail = error?.response?.data?.detail || error?.message || 'Failed to start processing';
      toast.error(`Processing failed: ${detail}`);
      console.error('Error starting classification:', error);
      throw error;
    }
  };

  const fetchReviewOutcomes = async () => {
    const res = await getReviewOutcomes();
    setReviewOutcomes(res);
  };

  const fetchBookClassifications = async (bookId: string): Promise<BookClassificationsResponse> => {
    const cached = classificationsCacheRef.current.get(bookId);
    if (cached) return cached;
  
    try {
      const res = await getBookClassifications(bookId);
      classificationsCacheRef.current.set(bookId, res);
      return res;
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        // No classifications found — return empty instead of throwing
        const emptyRes: BookClassificationsResponse = {
          book_id: bookId,
          classifications: []
        };
        classificationsCacheRef.current.set(bookId, emptyRes);
        return emptyRes;
      }
      throw error; // Re-throw other errors (500, network issues, etc.)
    }
  };

  const updateReviewOutcomeHandler = async (outcomeId: string, reviewType: string, data: ReviewUpdateRequest): Promise<ReviewUpdateResponse> => {
    return await updateReviewOutcome(outcomeId, reviewType, data);
  };

  const deleteReviewOutcomeHandler = async (outcomeId: string, reviewType: string): Promise<ReviewDeleteResponse> => {
    return await deleteReviewOutcome(outcomeId, reviewType);
  };

  const updateBook = async (bookId: string, data: Partial<Book>) => {
    await apiUpdateBook(bookId, data);
    await fetchBooks();
  };

  const removeClassificationFromChunkHandler = async (chunkId: string, label: string) => {
    await apiRemoveClassificationFromChunk(chunkId, label);
    // Refresh classifications cache for the affected book
    classificationsCacheRef.current.clear();
  };

  const jumpToClassificationCoordinates = (coordinates: number[], pageNumber: number) => {
    // This function will be called by components to navigate to specific coordinates
    // The actual implementation will be handled by the PDF viewer component
    console.log(`Jumping to coordinates: ${coordinates} on page ${pageNumber}`);
  };

  const updateClassificationFilter = async (bookId: string, name: string, value: number) => {
    await apiUpdateClassificationFilter(bookId, name, value);
    await fetchBooks();
  };

  const updateAnalysisFilters = async (bookId: string, analysisFilters?: string[], analysisConfidence?: number) => {
    await apiUpdateAnalysisFilters(bookId, analysisFilters, analysisConfidence);
    await fetchBooks();
  };

  // Clean up completed items from localStorage
  const cleanupCompletedItems = () => {
    if (typeof window !== 'undefined') {
      const incompleteClassifications = activeClassifications.filter(c => c.progress < 100);
      const incompleteAnalyses = activeAnalyses.filter(a => a.progress < 100);
      
      localStorage.setItem('activeClassifications', JSON.stringify(incompleteClassifications));
      localStorage.setItem('activeAnalyses', JSON.stringify(incompleteAnalyses));
    }
  };

  // Restore WebSocket connections for existing progress items
  const restoreWebSocketConnections = () => {
    // Restore classification WebSockets
    activeClassifications.forEach(classification => {
      if (classification.progress < 100) {
        const ws = connectToProgressWebSocket(classification.book_id, (progress: number, total?: number, done?: number, rawData?: any) => {
          setActiveClassifications(prev => 
            prev.map(c => 
              c.book_id === classification.book_id 
                ? { ...c, progress, total, done }
                : c
            )
          );
          
          // If progress is 100%, remove from active classifications after a delay
          if (progress === 100) {
            fetchBooks();
            setTimeout(() => {
              setActiveClassifications(prev => 
                prev.filter(c => c.book_id !== classification.book_id)
              );
              // Close WebSocket connection
              const wsToClose = websocketRefs.current.get(classification.book_id);
              if (wsToClose) {
                wsToClose.close();
                websocketRefs.current.delete(classification.book_id);
              }
            }, 2000);
          }
        });
        websocketRefs.current.set(classification.book_id, ws);
      }
    });

    // Restore analysis WebSockets
    activeAnalyses.forEach(analysis => {
      if (analysis.progress < 100) {
        const analysisWs = connectToAnalysisProgressWebSocket(analysis.book_id, (progress: number, total?: number, done?: number) => {
          setActiveAnalyses(prev => {
            const bookName = getBookNameById(analysis.book_id);
            const existing = prev.find(a => a.book_id === analysis.book_id);
            const updated = { book_id: analysis.book_id, progress, total, done, book_name: bookName } as AnalysisProgress;
            if (existing) {
              return prev.map(a => a.book_id === analysis.book_id ? updated : a);
            }
            return [...prev, updated];
          });
          if (progress === 100) {
            fetchBooks();
            setTimeout(() => {
              setActiveClassifications(prev => 
                prev.filter(c => c.book_id !== analysis.book_id)
              );
              // Close WebSocket connection
              const wsToClose = websocketRefs.current.get(analysis.book_id);
              if (wsToClose) {
                wsToClose.close();
                websocketRefs.current.delete(analysis.book_id);
              }
            }, 2000);
            setTimeout(() => {
              setActiveAnalyses(prev => prev.filter(a => a.book_id !== analysis.book_id));
              const wsToClose = websocketRefs.current.get(`${analysis.book_id}-analysis`);
              if (wsToClose) {
                wsToClose.close();
                websocketRefs.current.delete(`${analysis.book_id}-analysis`);
              }
            }, 2000);
          }
        });
        websocketRefs.current.set(`${analysis.book_id}-analysis`, analysisWs);
      }
    });
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

  // Save progress state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeClassifications', JSON.stringify(activeClassifications));
      cleanupCompletedItems();
    }
  }, [activeClassifications]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeAnalyses', JSON.stringify(activeAnalyses));
      cleanupCompletedItems();
    }
  }, [activeAnalyses]);

  useEffect(() => {
    if (!userLoading && user) {
      fetchBooks();
      restoreWebSocketConnections(); // Call the new function here
    } else if (!userLoading && !user) {
      setBooks([]); // clear if logged out
      setActiveClassifications([]); // clear active classifications
    }
  }, [user, userLoading]);

  return (
    <BookContext.Provider value={{
      books,
      activeClassifications,
      activeAnalyses,
      fetchBooks,
      createBook,
      getBookById: fetchBookById,
      getBookFile: fetchBookFile,
      assignSingleDepartment,
      addFeedback,
      indexBook,
      startClassification,
      getBookNameById,
      reviewOutcomes,
      fetchReviewOutcomes,
      getBookClassifications: fetchBookClassifications,
      updateReviewOutcome: updateReviewOutcomeHandler,
      deleteReviewOutcome: deleteReviewOutcomeHandler,
      updateBook,
      removeClassificationFromChunk: removeClassificationFromChunkHandler,
      jumpToClassificationCoordinates,
      updateClassificationFilter,
      updateAnalysisFilters,
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
