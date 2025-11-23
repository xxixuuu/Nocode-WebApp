import { useState } from 'react';
import { Sparkles, Send, Loader2, X, Code, Component, Lightbulb, Bug } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  onClose: () => void;
}

export function AIAssistant({ onClose }: AIAssistantProps) {
  const { components, addComponent } = useEditorStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant. I can help you generate components, review code, suggest improvements, and more. What would you like to do?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<'chat' | 'generate' | 'review' | 'optimize'>('chat');

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      let response: string;

      switch (activeMode) {
        case 'generate':
          response = await generateComponent(input);
          break;
        case 'review':
          response = await reviewCode(input);
          break;
        case 'optimize':
          response = await optimizeCode(input);
          break;
        default:
          response = await chatWithAI(input);
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateComponent = async (prompt: string): Promise<string> => {
    const response = await fetch('/api/ollama/generate-component', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) throw new Error('Failed to generate component');

    const data = await response.json();
    return data.suggestion || data.code || 'Component generated successfully!';
  };

  const reviewCode = async (code: string): Promise<string> => {
    const componentCode = code || JSON.stringify(components, null, 2);

    const response = await fetch('/api/ollama/review-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: componentCode }),
    });

    if (!response.ok) throw new Error('Failed to review code');

    const data = await response.json();
    return formatReviewResponse(data);
  };

  const optimizeCode = async (code: string): Promise<string> => {
    const componentCode = code || JSON.stringify(components, null, 2);

    const response = await fetch('/api/ollama/optimize-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: componentCode }),
    });

    if (!response.ok) throw new Error('Failed to optimize code');

    const data = await response.json();
    return data.optimizedCode || 'Code optimized successfully!';
  };

  const chatWithAI = async (message: string): Promise<string> => {
    // Simple echo for now - would integrate with Ollama chat endpoint
    return `I received your message: "${message}". How can I help you further?`;
  };

  const formatReviewResponse = (data: any): string => {
    if (!data) return 'Code review completed';

    let response = '**Code Review Results:**\n\n';

    if (data.issues && data.issues.length > 0) {
      response += '**Issues Found:**\n';
      data.issues.forEach((issue: any, index: number) => {
        response += `${index + 1}. ${issue.message} (${issue.severity})\n`;
      });
      response += '\n';
    }

    if (data.suggestions && data.suggestions.length > 0) {
      response += '**Suggestions:**\n';
      data.suggestions.forEach((suggestion: string, index: number) => {
        response += `${index + 1}. ${suggestion}\n`;
      });
      response += '\n';
    }

    if (data.score !== undefined) {
      response += `**Overall Score:** ${data.score}/100\n`;
    }

    return response;
  };

  const quickActions = [
    {
      label: 'Generate Component',
      icon: Component,
      mode: 'generate' as const,
      prompt: 'Create a responsive navbar with logo and navigation links',
    },
    {
      label: 'Review Code',
      icon: Code,
      mode: 'review' as const,
      prompt: 'Review my current components for best practices',
    },
    {
      label: 'Optimize',
      icon: Lightbulb,
      mode: 'optimize' as const,
      prompt: 'Optimize my components for performance',
    },
    {
      label: 'Debug',
      icon: Bug,
      mode: 'chat' as const,
      prompt: 'Help me debug an issue with my components',
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg shadow-xl w-[800px] h-[600px] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">AI Assistant</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-accent">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="px-6 py-3 border-b border-border">
          <div className="flex gap-2">
            {quickActions.map((action) => (
              <button
                key={action.mode}
                onClick={() => {
                  setActiveMode(action.mode);
                  setInput(action.prompt);
                }}
                className={`px-3 py-2 rounded text-sm flex items-center gap-2 transition-colors ${
                  activeMode === action.mode
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent'
                }`}
              >
                <action.icon className="w-4 h-4" />
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                <div className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg px-4 py-3">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-6 py-4 border-t border-border">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={`Ask AI to ${activeMode}...`}
              className="flex-1 px-4 py-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
