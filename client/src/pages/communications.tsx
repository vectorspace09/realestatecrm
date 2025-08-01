import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import DesktopHeader from "@/components/layout/desktop-header";
import MobileBottomTabs from "@/components/layout/mobile-bottom-tabs";
import AIChat from "@/components/layout/ai-chat";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Mail, Phone, MessageCircle, Calendar, Clock } from "lucide-react";

export default function Communications() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading || !isAuthenticated) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400">Loading...</p>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <DesktopHeader />
      
      <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-20 lg:pb-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Communications Center</h1>
              <p className="text-gray-400">Manage all client communications from one place</p>
            </div>
            <Button className="bg-primary-600 hover:bg-primary-700">
              <MessageSquare className="w-4 h-4 mr-2" />
              New Message
            </Button>
          </div>

          {/* Communication Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Today's Messages</p>
                    <p className="text-3xl font-bold text-white">12</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Emails Sent</p>
                    <p className="text-3xl font-bold text-white">47</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center">
                    <Mail className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Calls Made</p>
                    <p className="text-3xl font-bold text-white">23</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <Phone className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Response Rate</p>
                    <p className="text-3xl font-bold text-white">87%</p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Communications */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg text-white">Recent Messages</CardTitle>
                <CardDescription>Latest communications with clients</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-white">Emma Rodriguez</p>
                        <span className="text-xs text-gray-500">2h ago</span>
                      </div>
                      <p className="text-sm text-gray-400 truncate">
                        Thank you for the Manhattan property options...
                      </p>
                      <Badge variant="secondary" className="mt-1">Email</Badge>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
                      <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-white">Michael Chen</p>
                        <span className="text-xs text-gray-500">4h ago</span>
                      </div>
                      <p className="text-sm text-gray-400 truncate">
                        Discussed Tribeca penthouse viewing schedule
                      </p>
                      <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100 mt-1">Call</Badge>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-white">Sarah Johnson</p>
                        <span className="text-xs text-gray-500">6h ago</span>
                      </div>
                      <p className="text-sm text-gray-400 truncate">
                        Questions about financing options for first-time buyers
                      </p>
                      <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100 mt-1">SMS</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg text-white">Scheduled Communications</CardTitle>
                <CardDescription>Upcoming calls and appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-white">David Park</p>
                        <span className="text-xs text-gray-500">Tomorrow 2:00 PM</span>
                      </div>
                      <p className="text-sm text-gray-400">
                        Property viewing - Upper East Side penthouse
                      </p>
                      <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100 mt-1">Showing</Badge>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-white">Lisa Thompson</p>
                        <span className="text-xs text-gray-500">Today 4:30 PM</span>
                      </div>
                      <p className="text-sm text-gray-400">
                        Follow-up call on Chelsea condo offer
                      </p>
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 mt-1">Call</Badge>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
                      <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-white">Robert Kim</p>
                        <span className="text-xs text-gray-500">Friday 10:00 AM</span>
                      </div>
                      <p className="text-sm text-gray-400">
                        Send weekly market update newsletter
                      </p>
                      <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100 mt-1">Email</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg text-white">Quick Communication Actions</CardTitle>
              <CardDescription>Common communication tasks and templates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Send Follow-up Email</span>
                    <span className="text-xs text-gray-500 mt-1">Template-based emails</span>
                  </div>
                </Button>
                
                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Schedule Property Showing</span>
                    <span className="text-xs text-gray-500 mt-1">Book appointments</span>
                  </div>
                </Button>
                
                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Send Market Update</span>
                    <span className="text-xs text-gray-500 mt-1">Automated newsletters</span>
                  </div>
                </Button>
                
                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Log Phone Call</span>
                    <span className="text-xs text-gray-500 mt-1">Record call notes</span>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Communication Templates */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg text-white">Message Templates</CardTitle>
              <CardDescription>Pre-built templates for common communications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <h4 className="font-medium text-white mb-2">New Lead Welcome</h4>
                  <p className="text-sm text-gray-400 mb-3">
                    Thank you for your interest in our real estate services...
                  </p>
                  <Button variant="outline" size="sm">Use Template</Button>
                </div>
                
                <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <h4 className="font-medium text-white mb-2">Property Match Found</h4>
                  <p className="text-sm text-gray-400 mb-3">
                    I've found some properties that match your criteria...
                  </p>
                  <Button variant="outline" size="sm">Use Template</Button>
                </div>
                
                <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <h4 className="font-medium text-white mb-2">Showing Confirmation</h4>
                  <p className="text-sm text-gray-400 mb-3">
                    This confirms your property showing appointment...
                  </p>
                  <Button variant="outline" size="sm">Use Template</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>

      <MobileBottomTabs />
      <AIChat />
    </div>
  );
}