import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import Papa from 'papaparse';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';

// Setup PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const pickAndReadFile = async (): Promise<string | null> => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'text/csv', 'text/comma-separated-values'],
      copyToCacheDirectory: true,
    });

    if (result.canceled) {
      return null;
    }

    const file = result.assets[0];
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'csv') {
      const fileContent = await FileSystem.readAsStringAsync(file.uri);
      return parseCSV(fileContent);
    } else if (extension === 'pdf') {
      // For PDF we read as base64 and parse via pdfjs
      const fileContent = await FileSystem.readAsStringAsync(file.uri, { encoding: 'base64' });
      return await parsePDF(fileContent);
    } else {
      throw new Error('Unsupported file type');
    }
  } catch (error) {
    console.error('Error reading file:', error);
    throw error;
  }
};

const parseCSV = (csvString: string): string => {
  // We just return the raw text to let the AI agent parse it
  return csvString;
};

const parsePDF = async (base64String: string): Promise<string> => {
  try {
    const binaryString = atob(base64String);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    const loadingTask = pdfjsLib.getDocument({ data: bytes });
    const pdf = await loadingTask.promise;

    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
    }

    return fullText;
  } catch (error) {
    console.error("Error parsing PDF:", error);
    throw new Error("Could not extract text from PDF");
  }
};
