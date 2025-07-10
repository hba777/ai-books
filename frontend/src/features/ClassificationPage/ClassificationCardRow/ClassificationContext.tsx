import React, { createContext, useContext, useState, ReactNode } from 'react';

type FilterStatus = 'All' | 'Unprocessed' | 'Pending' | 'Processed' | 'Assigned' | 'Processing';

interface ClassificationContextType {
  currentFilter: FilterStatus;
  setCurrentFilter: (filter: FilterStatus) => void;
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

  return (
    <ClassificationContext.Provider value={{ currentFilter, setCurrentFilter }}>
      {children}
    </ClassificationContext.Provider>
  );
}; 