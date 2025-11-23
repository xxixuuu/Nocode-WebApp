import { useState } from 'react';
import { X, Loader2, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';

interface DeploymentModalProps {
  onClose: () => void;
  projectData: any;
}

type Platform = 'vercel' | 'railway';

interface DeploymentStatus {
  id: string;
  url: string;
  status: 'pending' | 'building' | 'ready' | 'error';
  platform: string;
  createdAt: Date;
}

export function DeploymentModal({ onClose, projectData }: DeploymentModalProps) {
  const [platform, setPlatform] = useState<Platform>('vercel');
  const [projectName, setProjectName] = useState('');
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [environmentVariables, setEnvironmentVariables] = useState('');
  const [deploying, setDeploying] = useState(false);
  const [deployment, setDeployment] = useState<DeploymentStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDeploy = async () => {
    setDeploying(true);
    setError(null);

    try {
      const envVars: Record<string, string> = {};

      // Parse environment variables
      if (environmentVariables) {
        environmentVariables.split('\n').forEach((line) => {
          const [key, value] = line.split('=');
          if (key && value) {
            envVars[key.trim()] = value.trim();
          }
        });
      }

      const config = {
        platform,
        projectName: projectName || 'generated-app',
        environmentVariables: envVars,
        framework: 'nextjs',
      };

      let response;

      if (platform === 'vercel') {
        response = await fetch('/api/deployment/vercel', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ config, projectData }),
        });
      } else {
        if (!repositoryUrl) {
          throw new Error('Repository URL is required for Railway deployment');
        }

        response = await fetch('/api/deployment/railway', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ config, repositoryUrl }),
        });
      }

      if (!response.ok) {
        throw new Error('Deployment failed');
      }

      const result = await response.json();
      setDeployment(result);

      // Poll for deployment status
      pollDeploymentStatus(result.id);
    } catch (err: any) {
      setError(err.message || 'Deployment failed');
    } finally {
      setDeploying(false);
    }
  };

  const pollDeploymentStatus = async (deploymentId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/deployment/status/${platform}/${deploymentId}`,
        );

        if (response.ok) {
          const status = await response.json();
          setDeployment(status);

          if (status.status === 'ready' || status.status === 'error') {
            clearInterval(interval);
          }
        }
      } catch (err) {
        console.error('Failed to poll deployment status:', err);
      }
    }, 3000); // Poll every 3 seconds

    // Stop polling after 5 minutes
    setTimeout(() => clearInterval(interval), 300000);
  };

  const getStatusIcon = () => {
    if (!deployment) return null;

    switch (deployment.status) {
      case 'ready':
        return <CheckCircle2 className="w-6 h-6 text-green-600" />;
      case 'error':
        return <XCircle className="w-6 h-6 text-red-600" />;
      case 'building':
      case 'pending':
        return <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    if (!deployment) return '';

    switch (deployment.status) {
      case 'ready':
        return 'Deployment successful!';
      case 'error':
        return 'Deployment failed';
      case 'building':
        return 'Building...';
      case 'pending':
        return 'Deployment queued...';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg shadow-xl w-[600px] max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-semibold">Deploy Your Application</h2>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-accent">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Platform</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPlatform('vercel')}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  platform === 'vercel'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="font-semibold mb-1">Vercel</div>
                <div className="text-xs text-muted-foreground">
                  Deploy with zero configuration
                </div>
              </button>
              <button
                onClick={() => setPlatform('railway')}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  platform === 'railway'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="font-semibold mb-1">Railway</div>
                <div className="text-xs text-muted-foreground">
                  Deploy from Git repository
                </div>
              </button>
            </div>
          </div>

          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Project Name
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="my-awesome-app"
            />
          </div>

          {/* Repository URL (Railway only) */}
          {platform === 'railway' && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Repository URL
              </label>
              <input
                type="text"
                value={repositoryUrl}
                onChange={(e) => setRepositoryUrl(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="https://github.com/username/repo"
              />
            </div>
          )}

          {/* Environment Variables */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Environment Variables (Optional)
            </label>
            <textarea
              value={environmentVariables}
              onChange={(e) => setEnvironmentVariables(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
              rows={4}
              placeholder="DATABASE_URL=postgres://...&#10;API_KEY=your-key"
            />
            <p className="text-xs text-muted-foreground mt-1">
              One variable per line in KEY=VALUE format
            </p>
          </div>

          {/* Deployment Status */}
          {deployment && (
            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                {getStatusIcon()}
                <div>
                  <div className="font-semibold">{getStatusText()}</div>
                  <div className="text-xs text-muted-foreground">
                    Deployment ID: {deployment.id}
                  </div>
                </div>
              </div>

              {deployment.status === 'ready' && deployment.url && (
                <a
                  href={deployment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  {deployment.url}
                </a>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              <div className="font-semibold mb-1">Error</div>
              <div className="text-sm">{error}</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded hover:bg-accent"
          >
            Cancel
          </button>
          <button
            onClick={handleDeploy}
            disabled={deploying || (platform === 'railway' && !repositoryUrl)}
            className="px-4 py-2 text-sm rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {deploying && <Loader2 className="w-4 h-4 animate-spin" />}
            {deploying ? 'Deploying...' : 'Deploy'}
          </button>
        </div>
      </div>
    </div>
  );
}
