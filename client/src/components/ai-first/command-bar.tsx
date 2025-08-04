import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Mic, 
  ArrowRight, 
  Clock, 
  Users, 
  Building, 
  DollarSign, 
  CheckSquare,
  Zap
} from "lucide-react";

interface CommandBarProps {
  className?: string;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: string;
  category: 'navigation' | 'action' | 'ai';
}

const quickActions: QuickAction[] = [
  { id: 'new-lead', label: 'New Lead', icon: Users, action: '/leads/new', category: 'action' },
  { id: 'new-task', label: 'New Task', icon: CheckSquare, action: '/tasks/new', category: 'action' },
  { id: 'properties', label: 'Properties', icon: Building, action: '/properties', category: 'navigation' },
  { id: 'deals', label: 'Deals', icon: DollarSign, action: '/deals', category: 'navigation' },
  { id: 'ai-insights', label: 'AI Insights', icon: Zap, action: '/ai?insights=true', category: 'ai' },
];

export default function CommandBar({ className = "" }: CommandBarProps) {
  const [query, setQuery] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [suggestions, setSuggestions] = useState<QuickAction[]>([]);
  const [, navigate] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);

  // Global keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !isActive) {
        e.preventDefault();
        setIsActive(true);
        inputRef.current?.focus();
      }
      if (e.key === 'Escape' && isActive) {
        setIsActive(false);
        setQuery("");
        inputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive]);

  // Filter suggestions based on query
  useEffect(() => {
    if (query.trim()) {
      const filtered = quickActions.filter(action =>
        action.label.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 4));
    } else if (isActive) {
      setSuggestions(quickActions.slice(0, 4));
    } else {
      setSuggestions([]);
    }
  }, [query, isActive]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (suggestions.length > 0) {
      handleActionClick(suggestions[0]);
    } else if (query.trim()) {
      // Navigate to AI assistant with query
      navigate(`/ai?query=${encodeURIComponent(query)}`);
    }
  };

  const handleActionClick = (action: QuickAction) => {
    setQuery("");
    setIsActive(false);
    if (action.action.startsWith('/')) {
      navigate(action.action);
    } else {
      // Handle other actions
      console.log('Action:', action.action);
    }
  };

  const handleVoiceInput = () => {
    // TODO: Implement voice input
    console.log('Voice input not yet implemented');
  };

  return (
    <div className={`relative ${className}`}>
      {/* Command Input */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsActive(true)}
            onBlur={() => setTimeout(() => setIsActive(false), 200)}
            placeholder="Type or speak a command..."
            className="pl-10 pr-12 h-12 bg-background border-border text-foreground placeholder:text-muted-foreground ai-body"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleVoiceInput}
            className="absolute right-2 p-2 hover:bg-secondary"
          >
            <Mic className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>

        {!query && !isActive && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Badge variant="outline" className="text-xs px-2 py-1">
              Press / to focus
            </Badge>
          </div>
        )}
      </form>

      {/* Suggestions Dropdown */}
      {isActive && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          {suggestions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => handleActionClick(action)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-secondary transition-colors ${
                  index === 0 ? 'bg-secondary/50' : ''
                }`}
              >
                <Icon className="w-4 h-4 text-primary" />
                <span className="ai-body text-card-foreground">{action.label}</span>
                <div className="ml-auto flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      action.category === 'ai' ? 'border-primary text-primary' :
                      action.category === 'action' ? 'border-success text-success' :
                      'border-muted-foreground text-muted-foreground'
                    }`}
                  >
                    {action.category}
                  </Badge>
                  {index === 0 && <ArrowRight className="w-3 h-3 text-muted-foreground" />}
                </div>
              </button>
            );
          })}
          
          {query && suggestions.length === 0 && (
            <div className="px-4 py-3 text-muted-foreground ai-body">
              Press Enter to ask AI: "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}