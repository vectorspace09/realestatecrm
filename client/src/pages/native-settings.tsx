import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import NativeHeader from "@/components/native/native-header";
import NativeBottomTabs from "@/components/native/native-bottom-tabs";
import NativeCard from "@/components/native/native-card";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe,
  Save,
  ChevronRight,
  Camera,
  Key,
  Download,
  Upload,
  LogOut
} from "lucide-react";

export default function NativeSettings() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [location, navigate] = useLocation();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Form state
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    license: "",
    brokerage: "",
    experience: "",
    specialties: ""
  });

  const [notificationSettings, setNotificationSettings] = useState({
    newLeads: true,
    taskReminders: true,
    dealUpdates: true,
    aiInsights: true,
    weeklyReports: false,
    emailNotifications: true,
    smsNotifications: false
  });

  const [preferences, setPreferences] = useState({
    theme: "dark",
    timezone: "america/new_york",
    language: "en",
    currency: "usd",
    dateFormat: "mm/dd/yyyy",
    density: "comfortable"
  });

  // Initialize form data from user
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: (user as any)?.firstName || "",
        lastName: (user as any)?.lastName || "",
        email: (user as any)?.email || "",
        phone: (user as any)?.phone || "",
        bio: (user as any)?.bio || "",
        license: (user as any)?.license || "",
        brokerage: (user as any)?.brokerage || "",
        experience: (user as any)?.experience || "",
        specialties: (user as any)?.specialties || ""
      });
    }
  }, [user]);

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

  const handleSaveProfile = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch('/api/settings/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch('/api/settings/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationSettings),
      });

      if (!response.ok) {
        throw new Error('Failed to update notifications');
      }

      toast({
        title: "Notifications Updated",
        description: "Your notification preferences have been saved.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update notifications. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSavePreferences = async () => {
    setIsUpdating(true);
    try {
      // TODO: Implement API call to save preferences
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Preferences Updated",
        description: "Your preferences have been saved.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-card flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="text-muted-foreground dark:text-muted-foreground mt-3 text-sm">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  const settingsSections = [
    { id: "profile", name: "Profile", icon: User, description: "Personal information and professional details" },
    { id: "notifications", name: "Notifications", icon: Bell, description: "Manage your notification preferences" },
    { id: "security", name: "Security", icon: Shield, description: "Account security and privacy settings" },
    { id: "appearance", name: "Appearance", icon: Palette, description: "Theme and display preferences" },
    { id: "preferences", name: "Preferences", icon: Globe, description: "Language, timezone, and regional settings" },
  ];

  // Main menu view
  if (!activeSection) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-card flex flex-col">
        <NativeHeader 
          title="Settings"
          rightButton={
            <button 
              className="p-2 rounded-lg text-muted-foreground hover:text-muted-foreground dark:hover:text-muted-foreground hover:bg-card dark:hover:bg-card transition-all duration-200 active:scale-95"
              onClick={() => window.location.href = "/api/logout"}
            >
              <LogOut className="w-5 h-5" />
            </button>
          }
        />
        
        <div className="flex-1 p-4 pb-20">
          {/* User Profile Card */}
          <NativeCard className="mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={(user as any)?.profileImageUrl} />
                  <AvatarFallback className="text-lg bg-gradient-to-br from-primary-500 to-purple-600 text-white">
                    {getInitials((user as any)?.firstName, (user as any)?.lastName)}
                  </AvatarFallback>
                </Avatar>
                <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs">
                  <Camera className="w-3 h-3" />
                </button>
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-muted-foreground dark:text-white">
                  {(user as any)?.firstName} {(user as any)?.lastName}
                </h2>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground">{(user as any)?.email}</p>
                <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">
                  Real Estate Professional
                </p>
              </div>
            </div>
          </NativeCard>

          {/* Settings Sections */}
          <div className="space-y-3">
            {settingsSections.map((section) => {
              const Icon = section.icon;
              return (
                <NativeCard 
                  key={section.id}
                  withPressEffect
                  onClick={() => setActiveSection(section.id)}
                  className="hover:border-primary-200 dark:hover:border-primary-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-muted-foreground dark:text-white">{section.name}</h3>
                        <p className="text-sm text-muted-foreground dark:text-muted-foreground">{section.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </NativeCard>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 space-y-3">
            <h3 className="text-lg font-semibold text-muted-foreground dark:text-white">Quick Actions</h3>
            
            <NativeCard withPressEffect>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                    <Download className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-muted-foreground dark:text-white">Export Data</h3>
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground">Download your data</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </NativeCard>

            <NativeCard withPressEffect>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Upload className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-muted-foreground dark:text-white">Import Data</h3>
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground">Upload your data</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </NativeCard>

            <NativeCard withPressEffect>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                    <Key className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-muted-foreground dark:text-white">API Keys</h3>
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground">Manage integrations</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </NativeCard>
          </div>
        </div>
        
        <NativeBottomTabs />
      </div>
    );
  }

  // Profile section
  if (activeSection === "profile") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-card flex flex-col">
        <NativeHeader 
          title="Profile Settings"
          showBackButton
          onBackClick={() => setActiveSection(null)}
          rightButton={
            <button 
              className="p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 active:scale-95 disabled:opacity-50"
              onClick={handleSaveProfile}
              disabled={isUpdating}
            >
              {isUpdating ? <LoadingSpinner size="sm" color="white" /> : <Save className="w-5 h-5" />}
            </button>
          }
        />
        
        <div className="flex-1 p-4 pb-20 space-y-6">
          {/* Profile Photo */}
          <NativeCard>
            <div className="text-center">
              <div className="relative inline-block">
                <Avatar className="w-24 h-24 mx-auto">
                  <AvatarImage src={(user as any)?.profileImageUrl} />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-primary-500 to-purple-600 text-white">
                    {getInitials(profileData.firstName, profileData.lastName)}
                  </AvatarFallback>
                </Avatar>
                <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-muted-foreground dark:text-white">Profile Photo</h3>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground">JPG, PNG or GIF. Max size 2MB.</p>
            </div>
          </NativeCard>

          {/* Personal Information */}
          <NativeCard>
            <h3 className="text-lg font-semibold text-muted-foreground dark:text-white mb-4">Personal Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName" 
                    value={profileData.firstName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName" 
                    value={profileData.lastName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  type="tel" 
                  value={profileData.phone}
                  onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+1 (555) 123-4567"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea 
                  id="bio" 
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself and your real estate expertise..."
                  rows={4}
                  className="mt-1"
                />
              </div>
            </div>
          </NativeCard>

          {/* Professional Information */}
          <NativeCard>
            <h3 className="text-lg font-semibold text-muted-foreground dark:text-white mb-4">Professional Information</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="license">Real Estate License #</Label>
                <Input 
                  id="license" 
                  value={profileData.license}
                  onChange={(e) => setProfileData(prev => ({ ...prev, license: e.target.value }))}
                  placeholder="Enter your license number"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="brokerage">Brokerage</Label>
                  <Input 
                    id="brokerage" 
                    value={profileData.brokerage}
                    onChange={(e) => setProfileData(prev => ({ ...prev, brokerage: e.target.value }))}
                    placeholder="Your brokerage name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="experience">Experience</Label>
                  <Select 
                    value={profileData.experience}
                    onValueChange={(value) => setProfileData(prev => ({ ...prev, experience: value }))}
                  >
                    <SelectTrigger className="mt-1">
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
                <Input 
                  id="specialties" 
                  value={profileData.specialties}
                  onChange={(e) => setProfileData(prev => ({ ...prev, specialties: e.target.value }))}
                  placeholder="e.g., Luxury homes, First-time buyers, Commercial"
                  className="mt-1"
                />
              </div>
            </div>
          </NativeCard>
        </div>
        
        <NativeBottomTabs />
      </div>
    );
  }

  // Other sections can be implemented similarly...
  // For brevity, I'll add the notifications section as an example

  if (activeSection === "notifications") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-card flex flex-col">
        <NativeHeader 
          title="Notifications"
          showBackButton
          onBackClick={() => setActiveSection(null)}
          rightButton={
            <button 
              className="p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 active:scale-95 disabled:opacity-50"
              onClick={handleSaveNotifications}
              disabled={isUpdating}
            >
              {isUpdating ? <LoadingSpinner size="sm" color="white" /> : <Save className="w-5 h-5" />}
            </button>
          }
        />
        
        <div className="flex-1 p-4 pb-20 space-y-4">
          <NativeCard>
            <h3 className="text-lg font-semibold text-muted-foreground dark:text-white mb-4">App Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-muted-foreground dark:text-white">New Lead Notifications</h4>
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground">Get notified when new leads are added</p>
                </div>
                <Switch 
                  checked={notificationSettings.newLeads}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, newLeads: checked }))}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-muted-foreground dark:text-white">Task Reminders</h4>
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground">Receive reminders for upcoming tasks</p>
                </div>
                <Switch 
                  checked={notificationSettings.taskReminders}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, taskReminders: checked }))}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-muted-foreground dark:text-white">Deal Updates</h4>
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground">Updates on deal status changes</p>
                </div>
                <Switch 
                  checked={notificationSettings.dealUpdates}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, dealUpdates: checked }))}
                />
              </div>
            </div>
          </NativeCard>

          <NativeCard>
            <h3 className="text-lg font-semibold text-muted-foreground dark:text-white mb-4">Communication Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-muted-foreground dark:text-white">Email Notifications</h4>
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch 
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-muted-foreground dark:text-white">SMS Notifications</h4>
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground">Receive notifications via SMS</p>
                </div>
                <Switch 
                  checked={notificationSettings.smsNotifications}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, smsNotifications: checked }))}
                />
              </div>
            </div>
          </NativeCard>
        </div>
        
        <NativeBottomTabs />
      </div>
    );
  }

  // Default fallback
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-card flex flex-col">
      <NativeHeader 
        title="Settings"
        showBackButton
        onBackClick={() => setActiveSection(null)}
      />
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-muted-foreground dark:text-muted-foreground">Section under development</p>
      </div>
      <NativeBottomTabs />
    </div>
  );
}