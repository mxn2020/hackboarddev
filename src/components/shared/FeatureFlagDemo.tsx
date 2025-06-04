// src/components/shared/FeatureFlagDemo.tsx
import React from 'react';
import { useFeatureFlag, useFeatureFlags } from '../../hooks/useFeatureFlags';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Zap,
  Brain,
  Plug,
  FlaskRound,
  CheckCircle,
  Clock,
  AlertCircle,
  Rocket,
  Mail,
  Calendar,
  Search,
  Shield,
  Image,
  Video,
  Volume2
} from 'lucide-react';

const FeatureFlagDemo: React.FC = () => {
  const { flags, isLoading } = useFeatureFlags();

  // Individual feature checks
  const qstashEnabled = useFeatureFlag('upstash_qstash');
  const vectorSearchEnabled = useFeatureFlag('upstash_vector_search');
  const workflowEnabled = useFeatureFlag('upstash_workflow');
  const fullTextSearchEnabled = useFeatureFlag('upstash_search');
  const identityEnabled = useFeatureFlag('netlify_identity');
  const blobsEnabled = useFeatureFlag('netlify_blobs');
  const sentryEnabled = useFeatureFlag('sentry_monitoring');
  const web3Enabled = useFeatureFlag('web3_token_gating');
  const ttsEnabled = useFeatureFlag('elevenlabs_tts');
  const videoEnabled = useFeatureFlag('tavus_personalized_video');

  const getFeatureIcon = (flagId: string) => {
    switch (flagId) {
      case 'upstash_qstash': return <Zap className="h-5 w-5" />;
      case 'upstash_vector_search': return <Brain className="h-5 w-5" />;
      case 'upstash_workflow': return <Plug className="h-5 w-5" />;
      case 'upstash_search': return <Search className="h-5 w-5" />;
      case 'netlify_identity': return <Shield className="h-5 w-5" />;
      case 'netlify_blobs': return <Image className="h-5 w-5" />;
      case 'sentry_monitoring': return <AlertCircle className="h-5 w-5" />;
      case 'web3_token_gating': return <FlaskRound className="h-5 w-5" />;
      case 'elevenlabs_tts': return <Volume2 className="h-5 w-5" />;
      case 'tavus_personalized_video': return <Video className="h-5 w-5" />;
      default: return <Plug className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (flag: any) => {
    if (flag.enabled && flag.status === 'active') {
      return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
    } else if (flag.status === 'shipping_soon') {
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />Coming Soon</Badge>;
    } else {
      return <Badge variant="outline">Disabled</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            Feature Flags Status
          </CardTitle>
          <CardDescription>
            Real-time feature availability based on current configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Active Features */}
          <div>
            <h3 className="font-medium text-green-700 dark:text-green-400 mb-3">✅ Active Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {qstashEnabled && (
                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                  <Zap className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">QStash Task Queue</p>
                    <p className="text-xs text-muted-foreground">Async welcome emails & background tasks</p>
                  </div>
                </div>
              )}
            </div>
            {!qstashEnabled && (
              <p className="text-sm text-muted-foreground italic">No features currently active</p>
            )}
          </div>

          {/* Coming Soon Features */}
          <div>
            <h3 className="font-medium text-blue-700 dark:text-blue-400 mb-3">🚀 Coming Soon</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {!vectorSearchEnabled && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                  <Brain className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">AI Vector Search</p>
                    <p className="text-xs text-muted-foreground">Semantic note search</p>
                  </div>
                </div>
              )}

              {!workflowEnabled && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                  <Plug className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Workflow Engine</p>
                    <p className="text-xs text-muted-foreground">Multi-step onboarding</p>
                  </div>
                </div>
              )}

              {!fullTextSearchEnabled && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                  <Search className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Full-Text Search</p>
                    <p className="text-xs text-muted-foreground">Fast blog & note search</p>
                  </div>
                </div>
              )}

              {!identityEnabled && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Social Logins</p>
                    <p className="text-xs text-muted-foreground">Google, GitHub auth</p>
                  </div>
                </div>
              )}

              {!blobsEnabled && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                  <Image className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Image Uploads</p>
                    <p className="text-xs text-muted-foreground">Avatars & blog images</p>
                  </div>
                </div>
              )}

              {!ttsEnabled && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                  <Volume2 className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Text-to-Speech</p>
                    <p className="text-xs text-muted-foreground">AI article narration</p>
                  </div>
                </div>
              )}

              {!videoEnabled && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                  <Video className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Personalized Videos</p>
                    <p className="text-xs text-muted-foreground">AI welcome videos</p>
                  </div>
                </div>
              )}

              {!sentryEnabled && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Error Monitoring</p>
                    <p className="text-xs text-muted-foreground">Sentry integration</p>
                  </div>
                </div>
              )}

              {!web3Enabled && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                  <FlaskRound className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Token Gating</p>
                    <p className="text-xs text-muted-foreground">Web3 premium content</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* QStash Demo Section */}
          {qstashEnabled && (
            <div className="border-t pt-4">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">⚡ QStash in Action</h3>
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-orange-600 mt-1" />
                  <div>
                    <p className="text-sm font-medium">Welcome Email Queue</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      When new users register, a welcome email is automatically queued via QStash and sent asynchronously.
                      This keeps registration fast while ensuring reliable email delivery with automatic retries.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Complete Feature Overview</CardTitle>
          <CardDescription>
            All available features and their current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {flags.map((flag) => (
              <div key={flag.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getFeatureIcon(flag.id)}
                  <div>
                    <p className="text-sm font-medium">{flag.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{flag.description}</p>
                  </div>
                </div>
                <div className="ml-2">
                  {getStatusBadge(flag)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeatureFlagDemo;