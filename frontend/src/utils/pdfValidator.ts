// Only import pdfjs on the client side to avoid SSR issues
let pdfjs: any = null;
let pdfjsPromise: Promise<any> | null = null;

const loadPDFJS = async () => {
  if (pdfjs) return pdfjs;
  if (pdfjsPromise) return pdfjsPromise;
  
  pdfjsPromise = import('react-pdf').then((module) => {
    pdfjs = module.pdfjs;
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.mjs";
    return pdfjs;
  });
  
  return pdfjsPromise;
};

export interface PDFValidationResult {
  isValid: boolean;
  isImageBased: boolean;
  error?: string;
  textContent?: string;
}

/**
 * Validates a PDF file and checks if it's image-based
 * @param file - The PDF file to validate
 * @returns Promise<PDFValidationResult>
 */
export const validatePDF = async (file: File): Promise<PDFValidationResult> => {
  try {
    // Check if we're on the client side
    if (typeof window === "undefined") {
      return {
        isValid: false,
        isImageBased: false,
        error: "PDF validation is only available on the client side."
      };
    }

    // Check file size (image-based PDFs are usually much larger)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return {
        isValid: false,
        isImageBased: true,
        error: "File size too large. This appears to be an image-based PDF which is not allowed."
      };
    }

    // Dynamically import pdfjs if not already loaded
    pdfjs = await loadPDFJS();

    // Create a blob URL for the file
    const blobUrl = URL.createObjectURL(file);
    
    try {
      // Load the PDF using PDF.js with timeout
      const pdf = await Promise.race([
        pdfjs.getDocument(blobUrl).promise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('PDF validation timeout')), 30000)
        )
      ]);
      
      let totalTextLength = 0;
      let totalPages = pdf.numPages;
      
      // Check first few pages for text content
      const pagesToCheck = Math.min(3, totalPages);
      
      for (let i = 1; i <= pagesToCheck; i++) {
        const page = await pdf.getPage(i);
        const textContent = await Promise.race([
          page.getTextContent(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Text extraction timeout')), 10000)
          )
        ]);
        
        // Extract text from text items
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        
        totalTextLength += pageText.length;
      }
      
      // Clean up the blob URL
      URL.revokeObjectURL(blobUrl);
      
      // If very little text is found, it's likely image-based
      const averageTextPerPage = totalTextLength / pagesToCheck;
      const isImageBased = averageTextPerPage < 50; // Less than 50 characters per page
      
      if (isImageBased) {
        return {
          isValid: false,
          isImageBased: true,
          error: "This PDF appears to be image-based (scanned images converted to PDF). Only text-based PDFs are allowed."
        };
      }
      
      return {
        isValid: true,
        isImageBased: false,
        textContent: `Found ${totalTextLength} characters across ${pagesToCheck} pages`
      };
      
    } catch (pdfError) {
      URL.revokeObjectURL(blobUrl);
      return {
        isValid: false,
        isImageBased: false,
        error: `Failed to read PDF: ${pdfError instanceof Error ? pdfError.message : 'Unknown error'}`
      };
    }
    
  } catch (error) {
    return {
      isValid: false,
      isImageBased: false,
      error: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

/**
 * Quick check for common image-based PDF indicators
 * @param file - The PDF file to check
 * @returns boolean - true if likely image-based
 */
export const quickImageBasedCheck = (file: File): boolean => {
  // Check if we're on the client side
  if (typeof window === "undefined") {
    return false; // Default to allowing on server side
  }

  // Image-based PDFs are typically much larger than text-based ones
  // A rough heuristic: if PDF is larger than 2MB per page, it's likely image-based
  const estimatedPages = Math.ceil(file.size / (2 * 1024 * 1024));
  
  // If estimated pages is very low (meaning file is very large), it's likely image-based
  return estimatedPages <= 1 && file.size > 5 * 1024 * 1024; // 5MB
};

/**
 * Basic PDF validation that doesn't require PDF.js
 * @param file - The PDF file to validate
 * @returns PDFValidationResult
 */
export const basicPDFValidation = (file: File): PDFValidationResult => {
  // Check file size
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      isImageBased: true,
      error: "File size too large. This appears to be an image-based PDF which is not allowed."
    };
  }

  // Basic file type check
  if (file.type !== "application/pdf") {
    return {
      isValid: false,
      isImageBased: false,
      error: "Only PDF files are allowed."
    };
  }

  return {
    isValid: true,
    isImageBased: false,
    textContent: "Basic validation passed"
  };
};
