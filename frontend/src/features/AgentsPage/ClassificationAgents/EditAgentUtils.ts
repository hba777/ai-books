
export function extractHeadingsAndPoints(prompt: string): { heading: string; points: string[] }[] {
    // Step 1: Decode escaped characters
    const decoded = prompt.replace(/\\n/g, '\n').replace(/\\"/g, '"');
  
    // Step 2: Split into lines and initialize
    const lines = decoded.split('\n');
    const result: { heading: string; points: string[] }[] = [];
    let currentHeading: string | null = null;
    let currentPoints: string[] = [];
  
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed === '') continue;
  
      // Updated regex to match numbered uppercase headings with colon (e.g., "1. CONTENT INDICATORS:")
      if (/^\d+\.\s*[A-Z\s]+:$/.test(trimmed)) {
        if (currentHeading && currentPoints.length > 0) {
          result.push({ heading: currentHeading, points: currentPoints });
        }
        currentHeading = trimmed.replace(/^\d+\.\s*/, '').replace(/:$/, '').trim();
        currentPoints = [];
        continue;
      }
  
      // Also optionally support non-numbered uppercase headings ending with a colon
      if (/^[A-Z\s]+:$/.test(trimmed)) {
        if (currentHeading && currentPoints.length > 0) {
          result.push({ heading: currentHeading, points: currentPoints });
        }
        currentHeading = trimmed.replace(/:$/, '').trim();
        currentPoints = [];
        continue;
      }
  
      // Points (start with * or number-dot)
      if (currentHeading && (/^\*/.test(trimmed) || /^\d+\./.test(trimmed))) {
        currentPoints.push(line); // Keep original formatting
      }
    }
  
    // Final push
    if (currentHeading && currentPoints.length > 0) {
      result.push({ heading: currentHeading, points: currentPoints });
    }
  
    return result;
  }
  