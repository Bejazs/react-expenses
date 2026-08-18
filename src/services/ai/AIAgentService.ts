import { Category } from '../../models/Category';

export interface AIExpense {
  description: string;
  amount: number;
  date: string; // ISO format
  categoryId: string;
}

export const analyzeStatement = async (
  text: string,
  categories: Category[],
  apiKey: string,
  provider: string = 'openai'
): Promise<AIExpense[]> => {
  if (!apiKey) {
    throw new Error('API Key is missing');
  }

  const categoryContext = categories.map(c => `- ${c.name} (ID: ${c.id})`).join('\n');

  const prompt = `
You are an AI assistant that analyzes bank statements. I will provide you with the text extracted from a bank statement (CSV or PDF).
Your job is to extract all the expenses and return them in a strict JSON array format.

Available categories in the system:
${categoryContext}

If an expense doesn't clearly match a category, map it to the closest one. If there is no good match, find a category that could mean "Other" or just pick the first one.

Ensure the output is ONLY a valid JSON array of objects, with no markdown formatting, no code blocks (like \`\`\`json), and no extra text.
The JSON must follow this exact schema for each expense:
[
  {
    "description": "Short description of the expense",
    "amount": 10.50, // Must be a positive number
    "date": "2023-10-05T00:00:00.000Z", // Must be a valid ISO 8601 date string
    "categoryId": "the-category-id-from-the-list-above"
  }
]

Statement Data:
${text}
`;

  try {
    let rawContent = '';

    if (provider === 'anthropic') {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1024,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Anthropic API Error:', errorText);
        throw new Error(`Anthropic API returned status ${response.status}`);
      }

      const data = await response.json();
      rawContent = data.content[0].text.trim();
    } else {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'system', content: prompt }],
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API Error:', errorText);
        throw new Error(`OpenAI API returned status ${response.status}`);
      }

      const data = await response.json();
      rawContent = data.choices[0].message.content.trim();
    }

    // Try to parse the JSON directly
    try {
      const parsed = JSON.parse(rawContent) as AIExpense[];
      return parsed;
    } catch (e) {
      // Fallback: If AI included markdown block despite instructions
      const jsonMatch = rawContent.match(/\[.*\]/s);
      if (jsonMatch) {
          return JSON.parse(jsonMatch[0]) as AIExpense[];
      }
      throw new Error('Failed to parse AI response into JSON');
    }

  } catch (error) {
    console.error('Error analyzing statement:', error);
    throw error;
  }
};
