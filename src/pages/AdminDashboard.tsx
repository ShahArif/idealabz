import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Lightbulb, 
  TrendingUp, 
  Settings, 
  LogOut,
  BarChart3,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, signOut } = useAuth();

  const stats = [
    {
      title: "Total Ideas",
      value: "142",
      change: "+12%",
      trend: "up",
      icon: Lightbulb,
      color: "text-blue-600"
    },
    {
      title: "Active Users",
      value: "89",
      change: "+5%",
      trend: "up", 
      icon: Users,
      color: "text-green-600"
    },
    {
      title: "In Review",
      value: "23",
      change: "-3%",
      trend: "down",
      icon: Clock,
      color: "text-yellow-600"
    },
    {
      title: "Approved",
      value: "45",
      change: "+8%",
      trend: "up",
      icon: CheckCircle,
      color: "text-emerald-600"
    }
  ];

  const recentIdeas = [
    {
      id: 1,
      title: "AI-Powered Code Review Assistant",
      author: "John Doe",
      status: "pending",
      date: "2024-01-15",
      votes: 12
    },
    {
      id: 2,
      title: "Employee Wellness Tracking App",
      author: "Jane Smith",
      status: "approved",
      date: "2024-01-14",
      votes: 8
    },
    {
      id: 3,
      title: "Smart Meeting Room Booking System",
      author: "Mike Johnson",
      status: "in-review",
      date: "2024-01-13",
      votes: 15
    },
    {
      id: 4,
      title: "Customer Feedback Analytics Platform",
      author: "Sarah Wilson",
      status: "pending",
      date: "2024-01-12",
      votes: 6
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'in-review': return 'bg-yellow-500';
      case 'pending': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Approved';
      case 'in-review': return 'In Review';
      case 'pending': return 'Pending';
      default: return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {user?.user_metadata?.first_name || 'Admin'}</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="gap-2">
                <Users className="h-3 w-3" />
                Administrator
              </Badge>
              <Button variant="outline" size="sm" onClick={signOut} className="gap-2">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className={`text-xs ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'} flex items-center gap-1 mt-1`}>
                      <TrendingUp className={`h-3 w-3 ${stat.trend === 'down' ? 'rotate-180' : ''}`} />
                      {stat.change} from last month
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg bg-secondary/20`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Ideas */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Recent Ideas
                </CardTitle>
                <CardDescription>
                  Latest idea submissions requiring attention
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentIdeas.map((idea) => (
                  <div key={idea.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{idea.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        by {idea.author} • {idea.date}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <TrendingUp className="h-4 w-4" />
                        {idea.votes}
                      </div>
                      <Badge 
                        variant="secondary" 
                        className={`${getStatusColor(idea.status)} text-white`}
                      >
                        {getStatusText(idea.status)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start gap-2">
                  <BarChart3 className="h-4 w-4" />
                  View Analytics
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Manage Comments
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Users className="h-4 w-4" />
                  User Management
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Settings className="h-4 w-4" />
                  Platform Settings
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database</span>
                  <Badge className="bg-green-500 text-white">Online</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">API</span>
                  <Badge className="bg-green-500 text-white">Healthy</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email Service</span>
                  <Badge className="bg-green-500 text-white">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Storage</span>
                  <Badge className="bg-yellow-500 text-white">87% Used</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;