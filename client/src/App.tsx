import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useMobile } from "@/hooks/use-mobile";
import { ThemeProvider } from "@/hooks/use-theme";
import { Suspense, lazy } from "react";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import NativeDashboard from "@/pages/native-dashboard";

// Lazy load heavy pages for better performance
const Leads = lazy(() => import("@/pages/leads"));
const NativeLeads = lazy(() => import("@/pages/native-leads"));
const LeadDetail = lazy(() => import("@/pages/lead-detail"));
const Properties = lazy(() => import("@/pages/properties"));
const PropertyDetail = lazy(() => import("@/pages/property-detail"));
const NativeProperties = lazy(() => import("@/pages/native-properties"));
const Deals = lazy(() => import("@/pages/deals"));
const NativeDeals = lazy(() => import("@/pages/native-deals"));
const Tasks = lazy(() => import("@/pages/tasks"));
const AI = lazy(() => import("@/pages/ai"));
const WorkflowBuilder = lazy(() => import("@/pages/workflows"));
const Analytics = lazy(() => import("@/pages/analytics"));
const Communications = lazy(() => import("@/pages/communications"));
const Integrations = lazy(() => import("@/pages/integrations"));
const Settings = lazy(() => import("@/pages/settings"));
const NativeSettings = lazy(() => import("@/pages/native-settings"));

// Loading component for lazy routes
import PageSkeleton from "@/components/loading/page-skeleton";
import { GlobalFAB } from "@/components/global/global-modals";
const PageLoading = () => <PageSkeleton />;

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const { isMobile } = useMobile();

  // Choose between native mobile app UI and desktop web UI
  const DashboardComponent = isMobile ? NativeDashboard : Dashboard;
  const LeadsComponent = isMobile ? NativeLeads : Leads;
  const PropertiesComponent = isMobile ? NativeProperties : Properties;
  const DealsComponent = isMobile ? NativeDeals : Deals;
  const SettingsComponent = isMobile ? NativeSettings : Settings;

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <Suspense fallback={<PageLoading />}>
          <Route path="/" component={DashboardComponent} />
          <Route path="/leads" component={LeadsComponent} />
          <Route path="/leads/new" component={LeadsComponent} />
          <Route path="/leads/:id" component={LeadDetail} />
          <Route path="/properties" component={PropertiesComponent} />
          <Route path="/properties/new" component={PropertiesComponent} />
          <Route path="/properties/:id" component={PropertyDetail} />
          <Route path="/deals" component={DealsComponent} />
          <Route path="/deals/new" component={DealsComponent} />
          <Route path="/tasks" component={Tasks} />
          <Route path="/tasks/new" component={Tasks} />
          <Route path="/ai" component={AI} />
          <Route path="/workflows" component={WorkflowBuilder} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/communications" component={Communications} />
          <Route path="/integrations" component={Integrations} />
          <Route path="/settings" component={SettingsComponent} />
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
          <GlobalFAB />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
