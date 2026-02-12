// Meeting category types for filtering
export type MeetingCategory = 
  | "board" 
  | "1on1" 
  | "standup" 
  | "client" 
  | "internal" 
  | "external" 
  | "all";

export interface User {
  id: string;
  name: string;
  avatar?: string;
}

// Authenticated user from backend
export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  picture_url: string | null;
  created_at: string | null;
  last_login_at: string | null;
}

// Source reference from RAG
export interface MessageSource {
  title?: string;
  date?: string | number;  // Can be Unix timestamp (ms) or formatted string
  transcript_id?: string;
  speakers?: string[];
  text_preview?: string;
  text?: string;  // Backend may return 'text' instead of 'text_preview'
  relevance_score?: number;
  meeting_category?: string | null;      // Inferred meeting category
  category_confidence?: number | null;   // Category inference confidence (0-1)
}

// Confidence scoring from RAG
export interface ConfidenceData {
  level: 'high' | 'medium' | 'low' | 'none';
  avg_score: number;
  top_score: number;
  chunk_count: number;
  should_fallback: boolean;
}

// Timing data from backend
export interface MessageTimings {
  retrieval_ms?: number;
  generation_ms?: number;
  total_ms?: number;
  prompt_build_ms?: number;
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  timestamp: Date;
  userId?: string;
  sources?: MessageSource[];  // Sources used for this specific message
  confidence?: ConfidenceData;  // Confidence scoring
  disclaimer?: string;  // Low confidence warning
  timings?: MessageTimings;  // Performance timing
  toolResult?: ToolResultEvent['data']; // Tool execution result
  toolName?: ToolName; // Name of the tool used
  attachments?: {
    id: string;
    name: string;
    type: 'pdf' | 'docx' | 'txt' | 'other';
    size?: number;
  }[];
  // Edit history: stores previous input/response pairs for version navigation
  pairedHistory?: {
    userContent: string;
    assistantContent: string;
  }[];
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  activeAttachments?: {
    id: string;
    name: string;
    type: 'pdf' | 'docx' | 'txt' | 'other';
    size?: number;
  }[];
}

export interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export interface ChatMessageProps {
  message: Message;
  isLoading?: boolean;
}

export interface SidebarProps {
  conversations: Conversation[];
  currentConversationId: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
}

export interface Source {
  title: string | null;
  date: string | number | null;  // Can be Unix timestamp (ms) or formatted string
  transcript_id: string | null;
  speakers: string[];
  text_preview: string;
  text?: string;  // Backend may return 'text' instead of 'text_preview'
  relevance_score: number | null;
  meeting_category?: string | null;      // Inferred meeting category
  category_confidence?: number | null;   // Category inference confidence (0-1)
}

// ============================================
// Tool/Agent Event Types (Phase 3)
// ============================================

export type ToolName = 'infographic_generator' | 'content_writer';

export interface ToolCallEvent {
  type: 'tool_call';
  tool: ToolName;
  status: 'starting';
  args: Record<string, unknown>;
  confidence: number;
}

export interface ToolProgressEvent {
  type: 'tool_progress';
  tool: ToolName;
  status: 'processing';
  message: string;
}

export interface ToolResultEvent {
  type: 'tool_result';
  tool: ToolName;
  status: 'complete';
  data: {
    // Infographic result
    structured_data?: {
      headline: string;
      subtitle?: string;
      stats?: Array<{ value: string; label: string; icon?: string }>;
      key_points?: string[];
    };
    image?: string;  // Base64 encoded image data
    image_url?: string;  // Presigned S3 URL for persistent storage
    s3_key?: string;  // S3 key for URL regeneration when presigned URL expires
    infographic_id?: string;  // Database ID for the infographic
    // Content writer result
    content?: string;
    content_type?: string;
    // Common
    sources?: Array<{ title: string; date?: string; score?: number; text_preview?: string; relevance_score?: number }>;
    timing_ms?: number;
  };
}

export interface ToolErrorEvent {
  type: 'tool_error';
  tool: ToolName;
  error: string;
}

export type ToolEvent = ToolCallEvent | ToolProgressEvent | ToolResultEvent | ToolErrorEvent;

// Extended Message type to include tool data
export interface ToolMessage extends Omit<Message, 'content'> {
  role: 'tool';
  toolName: ToolName;
  toolStatus: 'starting' | 'processing' | 'complete' | 'error';
  toolResult?: ToolResultEvent['data'];
  toolError?: string;
  content: string;  // Summary message for display
}

// ============================================
// Action Items Types (Phase 1A)
// ============================================

export type ActionItemPriority = 'critical' | 'high' | 'medium' | 'low';
export type ActionItemStatus = 'not_started' | 'in_progress' | 'completed' | 'cancelled' | 'blocked';
export type FeedbackType = 'accurate' | 'incorrect';
export type ErrorCategory = 'wrong_owner' | 'wrong_date' | 'wrong_task' | 'hallucination';

export interface ActionItemCreate {
  task_description: string;
  assigned_to: string;
  assigned_to_email?: string | null;
  due_date?: string | null;
  priority?: ActionItemPriority;
  status?: ActionItemStatus;
  confidence_score?: number | null;
  source_quote?: string | null;
  meeting_id?: string | null;
  meeting_title?: string | null;
  meeting_date?: string | null;
  project_name?: string | null;
  is_manual?: boolean;
  needs_review?: boolean;
  notes?: string | null;
}

export interface ActionItem {
  id: string;
  user_id: string;
  meeting_id: string | null;
  task_description: string;
  assigned_to: string;
  assigned_to_email: string | null;
  due_date: string | null;
  priority: ActionItemPriority;
  status: ActionItemStatus;
  confidence_score: number | null;
  source_quote: string | null;
  meeting_title: string | null;
  meeting_date: string | null;
  project_name: string | null;
  is_manual: boolean;
  needs_review: boolean;
  notes: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActionItemUpdate {
  task_description?: string;
  assigned_to?: string;
  assigned_to_email?: string | null;
  due_date?: string | null;
  priority?: ActionItemPriority;
  status?: ActionItemStatus;
  project_name?: string | null;
  notes?: string | null;
}

export interface ActionItemDependency {
  id: string;
  task_description: string;
  assigned_to: string;
  status: ActionItemStatus;
  priority: ActionItemPriority;
  due_date: string | null;
}

export interface ActionItemFeedback {
  id: string;
  action_item_id: string;
  user_id: string;
  feedback_type: FeedbackType;
  error_category: ErrorCategory | null;
  comment: string | null;
  created_at: string;
}

export interface ActionItemDetail extends ActionItem {
  dependencies: ActionItemDependency[];
  feedbacks: ActionItemFeedback[];
}

export interface ActionItemListResponse {
  items: ActionItem[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

export interface DependencyCreate {
  depends_on_id: string;
}

export interface DependencyResponse {
  id: string;
  action_item_id: string;
  depends_on_id: string;
  depends_on: ActionItemDependency;
  created_at: string;
}

export interface FeedbackCreate {
  feedback_type: FeedbackType;
  error_category?: ErrorCategory | null;
  comment?: string | null;
}

export interface ActionItemFilters {
  assigned_to?: string;
  status?: ActionItemStatus;
  priority?: ActionItemPriority;
  project_name?: string;
  meeting_id?: string;
  needs_review?: boolean;
  due_date_before?: string;
  due_date_after?: string;
  search?: string;
  sort_by?: 'created_at' | 'due_date' | 'priority' | 'status' | 'updated_at';
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}
