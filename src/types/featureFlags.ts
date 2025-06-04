// src/types/featureFlags.ts
export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: 'core' | 'ai' | 'integration' | 'experimental';
  status: 'active' | 'shipping_soon' | 'deprecated';
  createdAt: string;
  updatedAt: string;
  adminOnly?: boolean;
}

export interface FeatureFlagUpdate {
  enabled?: boolean;
  description?: string;
  status?: FeatureFlag['status'];
}

// Default feature flags based on the provided list
export const DEFAULT_FEATURE_FLAGS: Omit<FeatureFlag, 'createdAt' | 'updatedAt'>[] = [
  // Active Features
  {
    id: 'upstash_qstash',
    name: 'Upstash QStash Task Queue',
    description: 'Asynchronous task processing with Upstash QStash for welcome emails, scheduled blog posts, and background jobs',
    enabled: true,
    category: 'integration',
    status: 'active',
    adminOnly: false
  },

  // Shipping Soon Features
  {
    id: 'upstash_vector_search',
    name: 'Upstash Vector (AI-Powered Search)',
    description: 'Semantic search for notes using AI-generated vector embeddings. Search with natural language questions.',
    enabled: false,
    category: 'ai',
    status: 'shipping_soon',
    adminOnly: false
  },
  {
    id: 'upstash_workflow',
    name: 'Upstash Workflow (Durable Orchestration)',
    description: 'Multi-step user onboarding workflows with state management and retry handling',
    enabled: false,
    category: 'integration',
    status: 'shipping_soon',
    adminOnly: false
  },
  {
    id: 'upstash_search',
    name: 'Upstash Search (Full-Text Search)',
    description: 'Fast, typo-tolerant full-text search across blog posts and notes with instant results',
    enabled: false,
    category: 'core',
    status: 'shipping_soon',
    adminOnly: false
  },
  {
    id: 'netlify_identity',
    name: 'Netlify Identity Integration',
    description: 'Social logins (Google, GitHub) and secure password recovery flows with managed user database',
    enabled: false,
    category: 'integration',
    status: 'shipping_soon',
    adminOnly: false
  },
  {
    id: 'netlify_blobs',
    name: 'Netlify Blobs Image Uploads',
    description: 'File upload handling for user avatars and blog post images via Netlify Blobs',
    enabled: false,
    category: 'integration',
    status: 'shipping_soon',
    adminOnly: false
  },
  {
    id: 'sentry_monitoring',
    name: 'Sentry Error & Performance Monitoring',
    description: 'Production-grade error tracking and performance monitoring with Web Vitals',
    enabled: false,
    category: 'core',
    status: 'shipping_soon',
    adminOnly: false
  },
  {
    id: 'web3_token_gating',
    name: 'Web3 Token-Gated Content',
    description: 'Premium content access requiring specific NFTs or token holdings via Nodely.io',
    enabled: false,
    category: 'experimental',
    status: 'shipping_soon',
    adminOnly: false
  },
  {
    id: 'elevenlabs_tts',
    name: 'ElevenLabs Text-to-Speech',
    description: 'AI voice generation for article narration and audio notes with voice selection',
    enabled: false,
    category: 'ai',
    status: 'shipping_soon',
    adminOnly: false
  },
  {
    id: 'tavus_personalized_video',
    name: 'Tavus Personalized Video',
    description: 'AI-generated personalized welcome videos and milestone celebrations',
    enabled: false,
    category: 'ai',
    status: 'shipping_soon',
    adminOnly: false
  },

  // Experimental Features
  {
    id: 'advanced_analytics',
    name: 'Advanced Analytics Dashboard',
    description: 'Detailed usage analytics and user behavior insights for administrators',
    enabled: false,
    category: 'core',
    status: 'shipping_soon',
    adminOnly: true
  },
  {
    id: 'api_rate_limiting',
    name: 'Advanced API Rate Limiting',
    description: 'Configurable rate limiting per user role and endpoint with burst allowances',
    enabled: false,
    category: 'core',
    status: 'shipping_soon',
    adminOnly: true
  },
  {
    id: 'bearer_token_auth',
    name: 'Bearer Token Authentication',
    description: 'Use Bearer tokens in Authorization headers instead of HTTP-only cookies for authentication. Provides more flexibility for API integrations.',
    enabled: false,
    category: 'core',
    status: 'active',
    adminOnly: false
  }
];

export interface QStashTask {
  id: string;
  type: 'welcome_email' | 'scheduled_blog_post' | 'cleanup_task' | 'notification';
  payload: Record<string, any>;
  scheduledFor?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  retryCount: number;
  createdAt: string;
  updatedAt: string;
  userId?: string;
}