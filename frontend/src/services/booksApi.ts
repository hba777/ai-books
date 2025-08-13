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
  comment?: string;
  image_url?: string;
  timestamp: string;
}

export interface ClassificationProgress {
  book_id: string;
  progress: number;
  total?: number;
  done?: number;
  book_name?: string;
}

export interface ReviewDetailResponse {
  confidence?: number;
  human_review?: boolean;
  issue_found?: boolean;
  observation?: string;
  problematic_text?: string;
  recommendation?: string;
  retries?: number;
  status?: string;
}

export interface ReviewOutcomesResponse {
  _id?: string;
  Book_Name?: string;
  Chunk_no?: number;
  Chunk_ID?: string;
  doc_id?: string;
  FactCheckingReview?: ReviewDetailResponse;
  FederalUnityReview?: ReviewDetailResponse;
  ForeignRelationsReview?: ReviewDetailResponse;
  HistoricalNarrativeReview?: ReviewDetailResponse;
  InstitutionalIntegrityReview?: ReviewDetailResponse;
  NationalSecurityReview?: ReviewDetailResponse;
  RhetoricToneReview?: ReviewDetailResponse;
  overall_status?: string;
  Page_Number?: string;
  Predicted_Label?: string;
  Predicted_Label_Confidence?: number;
  Text_Analyzed?: string;
  timestamp?: string;
}

export interface ClassificationEntry {
  classification: string;
  confidence_score?: number;
}

export interface BookClassificationsResponse {
  book_id: string;
  classifications: ClassificationEntry[];
}

// WebSocket connection for progress tracking
export function connectToProgressWebSocket(
  bookId: string,
  onProgress: (progress: number, total?: number, done?: number, rawData?: any) => void
): WebSocket {

  const wsUrl = `ws://${process.env.NEXT_PUBLIC_BACKEND_HOST}/ws/progress/${bookId}`;
  
  const ws = new WebSocket(wsUrl);
  
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('[WebSocket] Received progress data:', data);
      if (data.progress !== undefined) {
        onProgress(data.progress, data.total, data.done, data);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  
  ws.onclose = () => {
    console.log('WebSocket connection closed');
  };
  
  return ws;
}

export function connectToIndexProgressWebSocket(
  bookId: string,
  onDone: () => void
): WebSocket {
  const wsUrl = `ws://${process.env.NEXT_PUBLIC_BACKEND_HOST}/ws/index-progress/${bookId}`;


  
  const ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log('[WebSocket] Connection established');
  };

  ws.onmessage = (event) => {
    console.log('[WebSocket] Message received:', event.data);
    if (event.data === 'done') {
      console.log('[WebSocket] Done signal received');
      onDone();
      ws.close();
    }
  };

  ws.onerror = (error) => {
    console.error('[WebSocket] Error:', error);
  };

  ws.onclose = (event) => {
    console.log('[WebSocket] Connection closed', event);
  };

  return ws;
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
export async function addFeedback(
  bookId: string, 
  department: string, 
  comment?: string, 
  image?: string
): Promise<{ message: string }> {
  const payload: any = { department };
  if (comment) payload.comment = comment;
  if (image) payload.image = image;
  
  const res = await api.post<{ message: string }>(`/books/${bookId}/feedback`, payload);
  return res.data;
}

// Assign single department
export async function assignSingleDepartment(bookId: string, department: string): Promise<{ message: string }> {
  const formData = new FormData();
  formData.append('department', department);
  
  const res = await api.post<{ message: string }>(`/books/${bookId}/assign-department`, formData);
  return res.data;
}

// Chunking Book
export async function indexBook(bookId: string): Promise<{ message: string; indexed_doc_id: string }> {
  const res = await api.post<{ message: string; indexed_doc_id: string }>(`/chunks/index-book/${bookId}`);
  return res.data;
}

// Start classification for a book
export async function startClassification(bookId: string): Promise<{ message: string; book_id: string; status: string; timestamp: string }> {
  const res = await api.post<{ message: string; book_id: string; status: string; timestamp: string }>(`/classification/${bookId}/start`);
  return res.data;
}

export async function getReviewOutcomes(): Promise<ReviewOutcomesResponse[]> {
  const res = await api.get("/review_outcomes/");
  return res.data;
}

export async function getBookClassifications(bookId: string): Promise<BookClassificationsResponse> {
  const res = await api.get<BookClassificationsResponse>(`/classification/classifications/${bookId}`);
  return res.data;
}

export async function updateBook(bookId: string, data: Partial<Book>): Promise<Book> {
  const res = await api.put<Book>(`/books/${bookId}`, data);
  return res.data;
}

export interface ReviewUpdateRequest {
  observation?: string;
  recommendation?: string;
}

export interface ReviewUpdateResponse {
  status: string;
  matched_count: number;
  modified_count: number;
  updated_fields: Record<string, string>;
}

export interface ReviewDeleteResponse {
  status: string;
  matched_count: number;
  modified_count: number;
  deleted_review_type: string;
  outcome_id: string;
}

export async function updateReviewOutcome(
  outcomeId: string, 
  reviewType: string, 
  data: ReviewUpdateRequest
): Promise<ReviewUpdateResponse> {
  const res = await api.put<ReviewUpdateResponse>(`/review_outcomes/update/${outcomeId}/${reviewType}`, data);
  return res.data;
}

export async function deleteReviewOutcome(outcomeId: string, reviewType: string): Promise<ReviewDeleteResponse> {
  const res = await api.delete<ReviewDeleteResponse>(`/review_outcomes/delete/${outcomeId}/${reviewType}`);
  return res.data;
}
