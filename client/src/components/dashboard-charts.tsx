import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COURSE_LEVEL_COLORS = ["#46cc71", "#3498db", "#9b59b6"];
const SUBSCRIPTION_COLORS = ["#ff9500", "#3498db"];
const USER_ROLE_COLORS = ["#46cc71", "#3498db", "#9b59b6"];

interface DashboardChartsProps {
  users: any[];
  courses: any[];
  sessions: any[];
}

export function DashboardCharts({ users, courses, sessions }: DashboardChartsProps) {
  if (!users || !courses || !sessions) {
    return null;
  }

  // User statistics by role
  const usersByRole = [
    { name: 'Students', value: users.filter(user => user.role === 'student').length },
    { name: 'Trainers', value: users.filter(user => user.role === 'trainer').length },
    { name: 'Admins', value: users.filter(user => user.role === 'admin').length }
  ];

  // Course statistics by level
  const coursesByLevel = [
    { name: 'Beginner', value: courses.filter(course => course.level === 'beginner').length },
    { name: 'Intermediate', value: courses.filter(course => course.level === 'intermediate').length },
    { name: 'Advanced', value: courses.filter(course => course.level === 'advanced').length }
  ];

  // Subscription stats
  const subscriptionStats = [
    { name: 'Subscribed', value: users.filter(user => user.isSubscribed).length },
    { name: 'Not Subscribed', value: users.filter(user => !user.isSubscribed).length }
  ];

  // Sessions per month
  const currentYear = new Date().getFullYear();
  const monthlySessionData = Array(12).fill(0).map((_, i) => {
    return { 
      name: new Date(currentYear, i, 1).toLocaleString('default', { month: 'short' }),
      sessions: 0
    };
  });

  sessions.forEach(session => {
    const sessionDate = new Date(session.date);
    if (sessionDate.getFullYear() === currentYear) {
      const monthIndex = sessionDate.getMonth();
      monthlySessionData[monthIndex].sessions++;
    }
  });

  // Category distribution
  const categoryCounts = {};
  courses.forEach(course => {
    const categoryName = course.category?.name || 'Uncategorized';
    categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
  });

  const categoryData = Object.entries(categoryCounts).map(([name, value]) => ({
    name,
    value
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* User Roles Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>User Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={usersByRole}
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {usersByRole.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={USER_ROLE_COLORS[index % USER_ROLE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Course Level Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Course Difficulty</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={coursesByLevel}
              margin={{
                top: 20, right: 30, left: 20, bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" name="Courses" barSize={60}>
                {coursesByLevel.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COURSE_LEVEL_COLORS[index % COURSE_LEVEL_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monthly Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Sessions Per Month</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={monthlySessionData}
              margin={{
                top: 10, right: 30, left: 0, bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="sessions" stroke="#3498db" fill="#3498db" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Subscription Status */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Status</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={subscriptionStats}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {subscriptionStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={SUBSCRIPTION_COLORS[index % SUBSCRIPTION_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}