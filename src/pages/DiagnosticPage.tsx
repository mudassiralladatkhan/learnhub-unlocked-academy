import { DatabaseStatus } from '@/components/diagnostic/DatabaseStatus';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RecommendedCourses } from '@/components/dashboard/RecommendedCourses';
import { Link } from 'react-router-dom';

export default function DiagnosticPage() {
  return (
    <div className="container py-8 space-y-8">
      <h1 className="text-3xl font-bold mb-6">Database Diagnostic Tool</h1>
      
      <p className="text-muted-foreground mb-8">
        This page helps you diagnose and fix issues with your Supabase database connection.
        You can check if your database is properly connected and if all required tables exist.
      </p>
      
      {/* Database Status Component */}
      <DatabaseStatus />
      
      {/* Course Display Test */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Course Display Test</CardTitle>
          <CardDescription>
            This shows the sample courses you've hardcoded, which will display even if the database connection fails
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecommendedCourses userId="" limit={3} />
        </CardContent>
        <CardFooter>
          <Button asChild>
            <Link to="/dashboard">Return to Dashboard</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
