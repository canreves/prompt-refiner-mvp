// Types matching backend schemas

// ============== Prompt Types ==============

export interface ParsedPrompt {
  role?: string | null;
  role_score?: number | null;
  task?: string | null;
  task_score?: number | null;
  context?: string | null;
  context_score?: number | null;
  style?: string | null;
  style_score?: number | null;
  output?: string | null;
  output_score?: number | null;
  rules?: string | null;
  rules_score?: number | null;
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
  status: string;
  promptID: string;
  parsedData: ParsedPrompt;
  overallScores: number;
  optimizedPromptID: string;
  optimizedPrompt: string;
  initialTokenSize: number;
  finalTokenSize: number;
  parseLatencyMs: number;
  optimizeLatencyMs: number;
  totalLatencyMs: number;
}

export interface ParseResponse {
  status: string;
  promptID: string;
  parsedData: ParsedPrompt;
  overallScores: number;
  completionTokens: number;
  promptTokens: number;
  parseLatencyMs: number;
}

export interface OptimizeExistingResponse {
  status: string;
  promptID: string;
  optimizedPromptID: string;
  optimizedPrompt: string;
  finalTokenSize: number;
  usedLLM: string;
  optimizeLatencyMs: number;
}

export interface FeedbackRequest {
  promptID: string | null;
  rating: number; // 1-5
}

export interface PromptHistoryResponse {
  prompts: PromptDBModel[];
  total: number;
}
