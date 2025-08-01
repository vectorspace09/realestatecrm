import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import DesktopHeader from "@/components/layout/desktop-header";
import MobileBottomTabs from "@/components/layout/mobile-bottom-tabs";
import AIChat from "@/components/layout/ai-chat";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Globe, Save } from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

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

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase() || "U";
  };

  if (isLoading || !isAuthenticated) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400">Loading...</p>
      </div>
    </div>;
  }

  const tabs = [
    { id: "profile", name: "Profile", icon: User },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "security", name: "Security", icon: Shield },
    { id: "appearance", name: "Appearance", icon: Palette },
    { id: "preferences", name: "Preferences", icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <DesktopHeader />
      
      <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-20 lg:pb-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-white">Settings</h1>
                <p className="text-gray-400">Manage your account settings and preferences</p>
              </div>
              <Button className="bg-primary-600 hover:bg-primary-700">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar Navigation */}
              <div className="lg:col-span-1">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-0">
                    <nav className="space-y-1">
                      {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                              activeTab === tab.id
                                ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-r-2 border-primary-600"
                                : "text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-700"
                            }`}
                          >
                            <Icon className="w-4 h-4 mr-3" />
                            {tab.name}
                          </button>
                        );
                      })}
                    </nav>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3">
                {activeTab === "profile" && (
                  <div className="space-y-6">
                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-lg text-white">Profile Information</CardTitle>
                        <CardDescription>Update your personal information and profile details</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center space-x-6">
                          <Avatar className="w-20 h-20">
                            <AvatarImage src={(user as any)?.profileImageUrl} />
                            <AvatarFallback className="text-lg">
                              {getInitials((user as any)?.firstName, (user as any)?.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <Button variant="outline">Change Photo</Button>
                            <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF. Max size 2MB.</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor="firstName">First Name</Label>
                            <Input id="firstName" defaultValue={(user as any)?.firstName || ""} />
                          </div>
                          <div>
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input id="lastName" defaultValue={(user as any)?.lastName || ""} />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="email">Email Address</Label>
                          <Input id="email" type="email" defaultValue={(user as any)?.email || ""} />
                        </div>

                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" />
                        </div>

                        <div>
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea 
                            id="bio" 
                            placeholder="Tell us about yourself and your real estate expertise..."
                            rows={4}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-lg text-white">Professional Information</CardTitle>
                        <CardDescription>Your real estate professional details</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div>
                          <Label htmlFor="license">Real Estate License #</Label>
                          <Input id="license" placeholder="Enter your license number" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor="brokerage">Brokerage</Label>
                            <Input id="brokerage" placeholder="Your brokerage name" />
                          </div>
                          <div>
                            <Label htmlFor="experience">Years of Experience</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select experience" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0-1">0-1 years</SelectItem>
                                <SelectItem value="2-5">2-5 years</SelectItem>
                                <SelectItem value="6-10">6-10 years</SelectItem>
                                <SelectItem value="10+">10+ years</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="specialties">Specialties</Label>
                          <Input id="specialties" placeholder="e.g., Luxury homes, First-time buyers, Commercial" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {activeTab === "notifications" && (
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-lg text-white">Notification Preferences</CardTitle>
                      <CardDescription>Choose how you want to be notified about important updates</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-white">New Lead Notifications</h4>
                            <p className="text-sm text-gray-400">Get notified when new leads are added</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-white">Task Reminders</h4>
                            <p className="text-sm text-gray-400">Receive reminders for upcoming tasks</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-white">Deal Updates</h4>
                            <p className="text-sm text-gray-400">Updates on deal status changes</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-white">AI Insights</h4>
                            <p className="text-sm text-gray-400">AI-generated insights and recommendations</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-white">Weekly Reports</h4>
                            <p className="text-sm text-gray-400">Weekly performance and activity summary</p>
                          </div>
                          <Switch />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {activeTab === "security" && (
                  <div className="space-y-6">
                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-lg text-white">Security Settings</CardTitle>
                        <CardDescription>Manage your account security and privacy</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div>
                          <h4 className="font-medium text-white mb-4">Login & Authentication</h4>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-white">Two-Factor Authentication</p>
                                <p className="text-sm text-gray-400">Add an extra layer of security</p>
                              </div>
                              <Button variant="outline">Enable</Button>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <h4 className="font-medium text-white mb-4">Active Sessions</h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                              <div>
                                <p className="font-medium text-white">Current Session</p>
                                <p className="text-sm text-gray-400">Chrome on Windows • New York, NY</p>
                              </div>
                              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100">
                                Active
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {activeTab === "appearance" && (
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-lg text-white">Appearance Settings</CardTitle>
                      <CardDescription>Customize how the application looks and feels</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <Label className="text-base font-medium text-white">Theme</Label>
                        <p className="text-sm text-gray-400 mb-4">Choose your preferred color scheme</p>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="p-4 border-2 border-primary-600 rounded-lg cursor-pointer">
                            <div className="w-full h-20 bg-white rounded border mb-2"></div>
                            <p className="text-sm font-medium text-center">Light</p>
                          </div>
                          <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer">
                            <div className="w-full h-20 bg-gray-900 rounded mb-2"></div>
                            <p className="text-sm font-medium text-center">Dark</p>
                          </div>
                          <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer">
                            <div className="w-full h-20 bg-gradient-to-br from-white to-gray-900 rounded mb-2"></div>
                            <p className="text-sm font-medium text-center">System</p>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <Label className="text-base font-medium text-white">Display Density</Label>
                        <p className="text-sm text-gray-400 mb-4">Choose how compact you want the interface</p>
                        <Select defaultValue="comfortable">
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="compact">Compact</SelectItem>
                            <SelectItem value="comfortable">Comfortable</SelectItem>
                            <SelectItem value="spacious">Spacious</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {activeTab === "preferences" && (
                  <div className="space-y-6">
                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-lg text-white">General Preferences</CardTitle>
                        <CardDescription>Configure your general application preferences</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor="timezone">Timezone</Label>
                            <Select defaultValue="america/new_york">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="america/new_york">Eastern Time (ET)</SelectItem>
                                <SelectItem value="america/chicago">Central Time (CT)</SelectItem>
                                <SelectItem value="america/denver">Mountain Time (MT)</SelectItem>
                                <SelectItem value="america/los_angeles">Pacific Time (PT)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="language">Language</Label>
                            <Select defaultValue="en">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="es">Spanish</SelectItem>
                                <SelectItem value="fr">French</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor="currency">Currency</Label>
                            <Select defaultValue="usd">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="usd">USD ($)</SelectItem>
                                <SelectItem value="eur">EUR (€)</SelectItem>
                                <SelectItem value="gbp">GBP (£)</SelectItem>
                                <SelectItem value="cad">CAD (C$)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="dateFormat">Date Format</Label>
                            <Select defaultValue="mm/dd/yyyy">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                                <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                                <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-lg text-white">Data & Privacy</CardTitle>
                        <CardDescription>Manage your data and privacy settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-white">Analytics & Performance</h4>
                            <p className="text-sm text-gray-400">Help improve the app by sharing usage data</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-white">Marketing Communications</h4>
                            <p className="text-sm text-gray-400">Receive updates about new features and tips</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

      <MobileBottomTabs />
      <AIChat />
    </div>
  );
}