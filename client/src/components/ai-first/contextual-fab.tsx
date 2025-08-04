import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Users, 
  CheckSquare, 
  Zap, 
  Building, 
  DollarSign,
  MessageSquare,
  MoreHorizontal
} from "lucide-react";

interface ContextualFABProps {
  className?: string;
}

interface FABAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  primary?: boolean;
}

export default function ContextualFAB({ className = "" }: ContextualFABProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [location, navigate] = useLocation();

  // Get contextual actions based on current route
  const getContextualActions = (): FABAction[] => {
    const baseActions: FABAction[] = [];

    if (location === '/' || location.startsWith('/dashboard')) {
      return [
        {
          id: 'new-lead',
          label: 'New Lead',
          icon: Users,
          action: () => navigate('/leads/new'),
          primary: true
        },
        {
          id: 'new-task',
          label: 'New Task',
          icon: CheckSquare,
          action: () => navigate('/tasks/new')
        },
        {
          id: 'ai-assist',
          label: 'AI Assistant',
          icon: Zap,
          action: () => navigate('/ai')
        }
      ];
    }

    if (location.startsWith('/leads')) {
      return [
        {
          id: 'new-lead',
          label: 'New Lead',
          icon: Users,
          action: () => navigate('/leads/new'),
          primary: true
        },
        {
          id: 'ai-score',
          label: 'AI Score Leads',
          icon: Zap,
          action: () => navigate('/ai?action=score-leads')
        }
      ];
    }

    if (location.startsWith('/properties')) {
      return [
        {
          id: 'new-property',
          label: 'New Property',
          icon: Building,
          action: () => navigate('/properties/new'),
          primary: true
        },
        {
          id: 'match-leads',
          label: 'Match to Leads',
          icon: Zap,
          action: () => navigate('/ai?action=match-properties')
        }
      ];
    }

    if (location.startsWith('/deals')) {
      return [
        {
          id: 'new-deal',
          label: 'New Deal',
          icon: DollarSign,
          action: () => {
            // Trigger the deal creation dialog
            const event = new CustomEvent('openDealDialog');
            window.dispatchEvent(event);
          },
          primary: true
        },
        {
          id: 'ai-insights',
          label: 'Deal Insights',
          icon: Zap,
          action: () => navigate('/ai?action=deal-insights')
        }
      ];
    }

    if (location.startsWith('/tasks')) {
      return [
        {
          id: 'new-task',
          label: 'New Task',
          icon: CheckSquare,
          action: () => navigate('/tasks/new'),
          primary: true
        },
        {
          id: 'ai-suggest',
          label: 'AI Suggestions',
          icon: Zap,
          action: () => navigate('/ai?action=suggest-tasks')
        }
      ];
    }

    if (location.startsWith('/ai')) {
      return [
        {
          id: 'new-chat',
          label: 'New Chat',
          icon: MessageSquare,
          action: () => navigate('/ai?new=true'),
          primary: true
        }
      ];
    }

    // Default actions
    return [
      {
        id: 'new-lead',
        label: 'New Lead',
        icon: Users,
        action: () => navigate('/leads/new'),
        primary: true
      }
    ];
  };

  const actions = getContextualActions();
  const primaryAction = actions.find(a => a.primary) || actions[0];
  const secondaryActions = actions.filter(a => !a.primary);

  const handlePrimaryAction = () => {
    if (secondaryActions.length > 0 && !isExpanded) {
      setIsExpanded(true);
    } else {
      primaryAction.action();
      setIsExpanded(false);
    }
  };

  const handleSecondaryAction = (action: FABAction) => {
    action.action();
    setIsExpanded(false);
  };

  // Auto-collapse after a timeout
  const handleExpansion = () => {
    if (isExpanded) {
      setTimeout(() => setIsExpanded(false), 5000);
    }
  };

  return (
    <div className={`fixed bottom-20 right-4 z-40 ${className}`}>
      {/* Secondary Actions */}
      {isExpanded && secondaryActions.length > 0 && (
        <div className="mb-3 space-y-2">
          {secondaryActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <div
                key={action.id}
                className="flex items-center justify-end gap-3 animate-in slide-in-from-bottom-2 duration-200"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Badge 
                  variant="secondary" 
                  className="bg-card border border-border shadow-lg px-3 py-1 ai-body"
                >
                  {action.label}
                </Badge>
                <Button
                  onClick={() => handleSecondaryAction(action)}
                  size="sm"
                  className="w-12 h-12 rounded-full bg-secondary border border-border shadow-lg hover:bg-secondary/80 transition-all"
                >
                  <Icon className="w-5 h-5 text-foreground" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Primary FAB */}
      <div className="relative">
        <Button
          onClick={handlePrimaryAction}
          onMouseEnter={handleExpansion}
          className={`w-14 h-14 rounded-full bg-primary hover:bg-primary-600 shadow-lg transition-all duration-200 ${
            isExpanded ? 'rotate-45' : 'rotate-0'
          }`}
        >
          {isExpanded && secondaryActions.length > 0 ? (
            <Plus className="w-6 h-6 text-primary-foreground" />
          ) : (
            <primaryAction.icon className="w-6 h-6 text-primary-foreground" />
          )}
        </Button>

        {/* Action label on hover */}
        {!isExpanded && (
          <div className="absolute right-16 top-1/2 -translate-y-1/2 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
            <Badge 
              variant="secondary" 
              className="bg-card border border-border shadow-lg px-3 py-1 ai-body whitespace-nowrap"
            >
              {primaryAction.label}
            </Badge>
          </div>
        )}

        {/* More indicator */}
        {!isExpanded && secondaryActions.length > 0 && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent border border-border rounded-full flex items-center justify-center">
            <MoreHorizontal className="w-2 h-2 text-accent-foreground" />
          </div>
        )}
      </div>
    </div>
  );
}