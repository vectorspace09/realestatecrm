import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const funnelData = [
  {
    stage: "New Leads",
    count: 1247,
    percentage: 100,
    color: "bg-blue-500",
  },
  {
    stage: "Contacted",
    count: 892,
    percentage: 72,
    color: "bg-indigo-500",
  },
  {
    stage: "Qualified",
    count: 456,
    percentage: 37,
    color: "bg-purple-500",
  },
  {
    stage: "Closed Won",
    count: 123,
    percentage: 10,
    color: "bg-emerald-500",
  },
];

export default function LeadFunnel() {
  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg text-gray-900 dark:text-white">Lead Conversion Funnel</CardTitle>
            <CardDescription>Track your lead conversion rates through each stage</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            View Details
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {funnelData.map((stage, index) => (
          <div key={stage.stage} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 ${stage.color} rounded`}></div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {stage.stage}
                </span>
              </div>
              <div className="text-right">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {stage.count.toLocaleString()}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                  ({stage.percentage}%)
                </span>
              </div>
            </div>
            <Progress 
              value={stage.percentage} 
              className="h-3"
              style={{
                background: `linear-gradient(to right, ${stage.color.replace('bg-', 'var(--')} 0%, ${stage.color.replace('bg-', 'var(--')} ${stage.percentage}%, #e5e7eb ${stage.percentage}%, #e5e7eb 100%)`
              }}
            />
            
            {index < funnelData.length - 1 && (
              <div className="flex justify-center">
                <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {Math.round(((funnelData[index + 1].count / stage.count) * 100))}% conversion
                </div>
              </div>
            )}
          </div>
        ))}
        
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                9.9%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Overall Conversion</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                $245K
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pipeline Value</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
