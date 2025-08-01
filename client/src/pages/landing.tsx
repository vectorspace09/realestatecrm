import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Building, TrendingUp, Zap, Bot, Star } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 flex items-center">
      <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center max-h-screen">
        
        {/* Left Side - Hero Content */}
        <div className="text-center lg:text-left space-y-6">
          <div className="flex items-center justify-center lg:justify-start mb-4">
            <img 
              src="/attached_assets/image_1753994146328.png" 
              alt="PRA Developers" 
              className="w-16 h-16 object-contain mr-4 filter brightness-110"
            />
            <h1 className="text-4xl lg:text-5xl font-bold text-white">
              PRA Developers
            </h1>
          </div>
          
          <h2 className="text-2xl lg:text-3xl font-semibold text-blue-400 mb-4">
            AI-Powered Real Estate CRM
          </h2>
          
          <p className="text-lg text-gray-300 mb-6 max-w-lg">
            Transform how you manage leads, properties, and deals with intelligent automation and AI-driven insights.
          </p>

          {/* Key Benefits */}
          <div className="space-y-3 mb-8">
            <div className="flex items-center justify-center lg:justify-start space-x-3">
              <Star className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <span className="text-gray-300">Smart lead scoring & automated follow-ups</span>
            </div>
            <div className="flex items-center justify-center lg:justify-start space-x-3">
              <Star className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <span className="text-gray-300">AI-powered property matching & insights</span>
            </div>
            <div className="flex items-center justify-center lg:justify-start space-x-3">
              <Star className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <span className="text-gray-300">Comprehensive deal tracking & analytics</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Button 
              onClick={handleLogin}
              size="lg"
              className="px-8 py-4 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xl hover:shadow-2xl transition-all duration-200"
            >
              Get Started Today
            </Button>
            <Button 
              onClick={handleLogin}
              variant="outline"
              size="lg"
              className="px-8 py-4 text-lg font-semibold border-2 border-blue-400 text-blue-400 bg-transparent hover:bg-blue-900/20 hover:border-blue-300 transition-all duration-200"
            >
              View Demo
            </Button>
          </div>
          
          <div className="text-sm text-gray-400 pt-4">
            ✨ <strong>Demo ready</strong> - 21 leads, 17 properties, 3 active deals
          </div>
        </div>

        {/* Right Side - Feature Grid */}
        <div className="grid grid-cols-2 gap-4 max-h-screen">
          <Card className="bg-gray-800/80 border-gray-700 hover:bg-gray-800 transition-all duration-200 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center mb-3">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Smart Leads
              </h3>
              <p className="text-sm text-gray-400">
                AI-powered lead scoring with drag-and-drop pipeline management
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/80 border-gray-700 hover:bg-gray-800 transition-all duration-200 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="w-10 h-10 bg-emerald-900 rounded-lg flex items-center justify-center mb-3">
                <Building className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Properties
              </h3>
              <p className="text-sm text-gray-400">
                Intelligent property matching with market insights and analytics
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/80 border-gray-700 hover:bg-gray-800 transition-all duration-200 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="w-10 h-10 bg-purple-900 rounded-lg flex items-center justify-center mb-3">
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Deal Tracking
              </h3>
              <p className="text-sm text-gray-400">
                End-to-end transaction management with commission calculations
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/80 border-gray-700 hover:bg-gray-800 transition-all duration-200 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="w-10 h-10 bg-amber-900 rounded-lg flex items-center justify-center mb-3">
                <Zap className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Automation
              </h3>
              <p className="text-sm text-gray-400">
                Smart workflows with AI-driven recommendations and tasks
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/80 border-gray-700 hover:bg-gray-800 transition-all duration-200 backdrop-blur-sm col-span-2">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-rose-900 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-rose-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">
                    AI Assistant
                  </h3>
                  <p className="text-sm text-gray-400">
                    24/7 AI assistant for lead qualification, property matching, and communication drafting
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
