// Default API keys for demo purposes
// Use environment variable or user-provided key
export const DEFAULT_OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';

// Helper function to get the API key (uses user's key if available, otherwise default)
export const getOpenAIKey = (userKey?: string): string => {
  return userKey || DEFAULT_OPENAI_KEY;
};
