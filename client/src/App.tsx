import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/use-theme";
import { Suspense, lazy } from "react";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";

// Lazy load heavy pages for better performance
const Leads = lazy(() => import("@/pages/leads"));
const LeadDetail = lazy(() => import("@/pages/lead-detail"));
const Properties = lazy(() => import("@/pages/properties"));
const Deals = lazy(() => import("@/pages/deals"));
const Tasks = lazy(() => import("@/pages/tasks"));
const AI = lazy(() => import("@/pages/ai"));
const WorkflowBuilder = lazy(() => import("@/pages/workflows"));
const Analytics = lazy(() => import("@/pages/analytics"));
const Communications = lazy(() => import("@/pages/communications"));
const Integrations = lazy(() => import("@/pages/integrations"));
const Settings = lazy(() => import("@/pages/settings"));

// Loading component for lazy routes
import PageSkeleton from "@/components/loading/page-skeleton";
const PageLoading = () => <PageSkeleton />;

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <Suspense fallback={<PageLoading />}>
          <Route path="/" component={Dashboard} />
          <Route path="/leads" component={Leads} />
          <Route path="/leads/:id" component={LeadDetail} />
          <Route path="/properties" component={Properties} />
          <Route path="/deals" component={Deals} />
          <Route path="/tasks" component={Tasks} />
          <Route path="/ai" component={AI} />
          <Route path="/workflows" component={WorkflowBuilder} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/communications" component={Communications} />
          <Route path="/integrations" component={Integrations} />
          <Route path="/settings" component={Settings} />
        </Suspense>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
