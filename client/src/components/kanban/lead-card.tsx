import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DollarSign, MapPin, Clock, Phone, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { Lead } from "@shared/schema";

interface LeadCardProps {
  lead: Lead;
}

export default function LeadCard({ lead }: LeadCardProps) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    if (score >= 60) return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
    return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "HOT";
    if (score >= 60) return "WARM";
    return "COLD";
  };

  const formatBudget = (budget?: string | number, budgetMax?: string | number) => {
    if (!budget) return "Budget not specified";
    
    const min = typeof budget === "string" ? parseFloat(budget) : budget;
    const max = budgetMax ? (typeof budgetMax === "string" ? parseFloat(budgetMax) : budgetMax) : null;
    
    if (max && max !== min) {
      return `$${(min / 1000).toFixed(0)}K - $${(max / 1000).toFixed(0)}K`;
    }
    return `$${(min / 1000).toFixed(0)}K+`;
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-medium">
              {getInitials(lead.firstName, lead.lastName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">
              {lead.firstName} {lead.lastName}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {lead.email}
            </p>
          </div>
        </div>
        <Badge className={cn("text-xs font-medium", getScoreColor(lead.score || 0))}>
          {getScoreLabel(lead.score || 0)}
        </Badge>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center text-gray-600 dark:text-gray-400">
          <DollarSign className="w-4 h-4 mr-2" />
          {formatBudget(lead.budget, lead.budgetMax)}
        </div>
        
        {lead.preferredLocations && lead.preferredLocations.length > 0 && (
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <MapPin className="w-4 h-4 mr-2" />
            {lead.preferredLocations.slice(0, 2).join(", ")}
            {lead.preferredLocations.length > 2 && " +more"}
          </div>
        )}
        
        <div className="flex items-center text-gray-600 dark:text-gray-400">
          <Clock className="w-4 h-4 mr-2" />
          Added {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-primary-600 hover:text-primary-700 text-xs p-1 h-auto"
          >
            <Phone className="w-3 h-3 mr-1" />
            Call
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-emerald-600 hover:text-emerald-700 text-xs p-1 h-auto"
          >
            <MessageSquare className="w-3 h-3 mr-1" />
            WhatsApp
          </Button>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Score: {lead.score || 0}/100
        </div>
      </div>
    </div>
  );
}
