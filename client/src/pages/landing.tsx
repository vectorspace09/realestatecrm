import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Users, Building, TrendingUp, Zap, Bot } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex flex-col sm:flex-row items-center justify-center mb-8">
            <img 
              src="/attached_assets/image_1753994146328.png" 
              alt="PRA Developers" 
              className="w-20 h-20 object-contain mb-4 sm:mb-0 sm:mr-6 filter brightness-110"
            />
            <h1 className="text-4xl md:text-6xl font-bold text-white">
              PRA Developers
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            AI-Powered Real Estate CRM that transforms how you manage leads, properties, and deals
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={handleLogin}
              size="lg"
              className="w-full sm:w-auto px-8 py-4 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              Get Started Today
            </Button>
            <Button 
              onClick={handleLogin}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto px-8 py-4 text-lg font-semibold border-2 border-blue-400 text-blue-400 bg-gray-800 hover:bg-gray-700 hover:border-blue-300 transition-all duration-200"
            >
              View Demo
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="bg-gray-800 border-gray-700 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Smart Lead Management
              </h3>
              <p className="text-gray-400">
                Drag-and-drop pipeline with AI-powered lead scoring and automated follow-ups
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-emerald-900 rounded-lg flex items-center justify-center mb-4">
                <Building className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Property Intelligence
              </h3>
              <p className="text-gray-400">
                Comprehensive property management with AI-powered matching and market insights
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Deal Tracking
              </h3>
              <p className="text-gray-400">
                End-to-end transaction management with milestone tracking and commission calculations
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Workflow Automation
              </h3>
              <p className="text-gray-400">
                Automate repetitive tasks with smart workflows and AI-driven recommendations
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900 rounded-lg flex items-center justify-center mb-4">
                <Bot className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                AI Assistant
              </h3>
              <p className="text-gray-400">
                24/7 AI assistant for lead qualification, property matching, and communication drafting
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Analytics & Insights
              </h3>
              <p className="text-gray-400">
                Comprehensive dashboards with performance metrics and predictive analytics
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gray-800 rounded-2xl p-12 shadow-lg border border-gray-700">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Real Estate Business?
          </h2>
          <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of real estate professionals who have increased their productivity and closed more deals with PRA Developers CRM
          </p>
          <Button 
            onClick={handleLogin}
            size="lg"
            className="px-8 py-4 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            Start Your Free Trial
          </Button>
        </div>
      </div>
    </div>
  );
}
