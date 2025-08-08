import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useBooks } from '../../../context/BookContext';

type FilterStatus = 'All' | 'Unprocessed' | 'Pending' | 'Processed' | 'Assigned' | 'Processing';

interface ClassificationContextType {
  currentFilter: FilterStatus;
  setCurrentFilter: (filter: FilterStatus) => void;
  isAnyBookProcessing: boolean;
}

const ClassificationContext = createContext<ClassificationContextType | undefined>(undefined);

export const useClassificationContext = () => {
  const context = useContext(ClassificationContext);
  if (context === undefined) {
    throw new Error('useClassificationContext must be used within a ClassificationProvider');
  }
  return context;
};

interface ClassificationProviderProps {
  children: ReactNode;
}

export const ClassificationProvider: React.FC<ClassificationProviderProps> = ({ children }) => {
  const [currentFilter, setCurrentFilter] = useState<FilterStatus>('All');
  const { books } = useBooks();
  const isAnyBookProcessing = books.some(
    (book) => book.status === 'Indexing' || book.status === 'Processing'
  );
  return (
    <ClassificationContext.Provider value={{ currentFilter, setCurrentFilter, isAnyBookProcessing }}>
      {children}
    </ClassificationContext.Provider>
  );
}; 