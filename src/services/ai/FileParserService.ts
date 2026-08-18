import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import Papa from 'papaparse';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

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
      let fileContent = '';
      if (Platform.OS === 'web') {
        const res = await fetch(file.uri);
        fileContent = await res.text();
      } else {
        fileContent = await FileSystem.readAsStringAsync(file.uri);
      }
      return parseCSV(fileContent);
    } else if (extension === 'pdf') {
      let base64Content = '';
      if (Platform.OS === 'web') {
         const res = await fetch(file.uri);
         const blob = await res.blob();
         base64Content = await new Promise<string>((resolve, reject) => {
           const reader = new FileReader();
           reader.onloadend = () => {
             const result = reader.result as string;
             resolve(result.split(',')[1]);
           };
           reader.onerror = reject;
           reader.readAsDataURL(blob);
         });
      } else {
         base64Content = await FileSystem.readAsStringAsync(file.uri, { encoding: 'base64' });
      }
      return await parsePDF(base64Content);
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
