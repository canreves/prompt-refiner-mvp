// Types matching backend schemas

// ============== Prompt Types ==============

export interface ParsedPrompt {
  role?: string | null;
  task?: string | null;
  context?: string | null;
  style?: string | null;
  output?: string | null;
}

export interface PromptInput {
  userID: string;
  inputPrompt: string;
  targetRole?: string;
}

export interface PromptDBModel {
  promptID: string;
  userID: string;
  projectID: string;
  inputPrompt: string;

  parsedData?: ParsedPrompt | null;
  optimizedPrompts?: Record<string, string> | null;
  usedLLMs?: Record<string, string> | null;

  // metrics
  initialTokenSize: number;
  finalTokenSizes: Record<string, number>;
  latencyMs: Record<string, number>;
  copyCount: number;
  overallScores?: Record<string, number> | null;

  // metadata
  createdAt: string; // ISO date string
  isFavorite: boolean;
  ratings?: Record<string, number> | null; // [1,5]
}

// ============== User Types ==============

export interface ProjectRef {
  projectID: string;
  projectName: string;
}

export interface User {
  userID: string;
  name: string;
  surname: string;
  username: string;
  createdAt: string; // ISO date string
  last50Prompts: string[]; // list of prompt IDs
  email: string;
  profileImageURL?: string | null;
  projectIDs: ProjectRef[];
}

// ============== Auth Types ==============

export interface AuthUser {
  uid: string;
  email: string;
  name?: string | null;
  picture?: string | null;
  is_new_user?: boolean;
}

export interface TokenVerifyRequest {
  id_token: string;
}

export interface TokenVerifyResponse {
  uid: string;
  email: string;
  name?: string | null;
  picture?: string | null;
  is_new_user: boolean;
}

// ============== API Response Types ==============

export interface OptimizeResponse {
  promptID: string;
  optimizedPrompts: Record<string, string>;
  parsedData: ParsedPrompt;
  overallScores: Record<string, number>;
  latencyMs: Record<string, number>;
  initialTokenSize: number;
  finalTokenSizes: Record<string, number>;
}

export interface FeedbackRequest {
  promptID: string | null;
  rating: number; // 1-5
}

export interface PromptHistoryResponse {
  prompts: PromptDBModel[];
  total: number;
}
