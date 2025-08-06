import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Lightbulb, 
  TrendingUp, 
  LogOut,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Users
} from 'lucide-react';

const EmployeeDashboard = () => {
  const { user, signOut } = useAuth();

  const myIdeas = [
    {
      id: 1,
      title: "AI-Powered Code Review Assistant",
      status: "in-review",
      date: "2024-01-15",
      votes: 12,
      comments: 3
    },
    {
      id: 2,
      title: "Employee Wellness Tracking App", 
      status: "approved",
      date: "2024-01-10",
      votes: 8,
      comments: 5
    },
    {
      id: 3,
      title: "Smart Meeting Room Booking System",
      status: "pending",
      date: "2024-01-08",
      votes: 15,
      comments: 2
    }
  ];

  const recentActivity = [
    {
      type: "comment",
      message: "New comment on your idea 'AI-Powered Code Review Assistant'",
      time: "2 hours ago"
    },
    {
      type: "status",
      message: "Your idea 'Employee Wellness App' was approved!",
      time: "1 day ago"
    },
    {
      type: "vote",
      message: "Your idea 'Smart Meeting Room' received 3 new votes",
      time: "2 days ago"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'in-review': return 'bg-yellow-500';
      case 'pending': return 'bg-gray-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Approved';
      case 'in-review': return 'In Review';
      case 'pending': return 'Pending';
      case 'rejected': return 'Rejected';
      default: return 'Unknown';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'comment': return MessageSquare;
      case 'status': return CheckCircle;
      case 'vote': return TrendingUp;
      default: return AlertCircle;
    }
  };

  const totalIdeas = myIdeas.length;
  const approvedIdeas = myIdeas.filter(idea => idea.status === 'approved').length;
  const pendingIdeas = myIdeas.filter(idea => idea.status === 'pending').length;
  const totalVotes = myIdeas.reduce((sum, idea) => sum + idea.votes, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">My Ideas Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {user?.user_metadata?.first_name || user?.email?.split('@')[0]}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="gap-2">
                <Users className="h-3 w-3" />
                Employee
              </Badge>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Submit New Idea
              </Button>
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
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Total Ideas
                  </p>
                  <p className="text-2xl font-bold">{totalIdeas}</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-500/20">
                  <Lightbulb className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Approved
                  </p>
                  <p className="text-2xl font-bold">{approvedIdeas}</p>
                </div>
                <div className="p-3 rounded-lg bg-green-500/20">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Pending
                  </p>
                  <p className="text-2xl font-bold">{pendingIdeas}</p>
                </div>
                <div className="p-3 rounded-lg bg-yellow-500/20">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Total Votes
                  </p>
                  <p className="text-2xl font-bold">{totalVotes}</p>
                </div>
                <div className="p-3 rounded-lg bg-purple-500/20">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* My Ideas */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  My Ideas
                </CardTitle>
                <CardDescription>
                  Track the status of your submitted ideas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {myIdeas.map((idea) => (
                  <div key={idea.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{idea.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        Submitted on {idea.date}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          {idea.votes}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          {idea.comments}
                        </div>
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

          {/* Recent Activity & Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentActivity.map((activity, index) => {
                  const IconComponent = getActivityIcon(activity.type);
                  return (
                    <div key={index} className="flex gap-3 p-3 border rounded-lg">
                      <IconComponent className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm">{activity.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start gap-2">
                  <Plus className="h-4 w-4" />
                  Submit New Idea
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <FileText className="h-4 w-4" />
                  Browse All Ideas
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <MessageSquare className="h-4 w-4" />
                  My Comments
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;