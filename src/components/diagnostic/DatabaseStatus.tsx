import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { testDatabaseConnection, verifyTables, setupMissingTables } from '@/lib/supabaseHelper';
import { useToast } from '@/hooks/use-toast';

export function DatabaseStatus() {
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<any>(null);
  const [tablesStatus, setTablesStatus] = useState<any>(null);
  const [isFixing, setIsFixing] = useState(false);
  const { toast } = useToast();

  const checkConnection = async () => {
    setIsLoading(true);
    try {
      const status = await testDatabaseConnection();
      setConnectionStatus(status);
      
      if (status.connected) {
        const tableResults = await verifyTables();
        setTablesStatus(tableResults);
      }
    } catch (error) {
      console.error('Error checking database:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const fixMissingTables = async () => {
    setIsFixing(true);
    try {
      const result = await setupMissingTables();
      
      if (result.success) {
        toast({
          title: "Tables Created",
          description: "Missing database tables have been created successfully.",
        });
        
        // Refresh table status
        await checkConnection();
      } else {
        toast({
          title: "Table Creation Failed",
          description: "Could not create all missing tables. Check console for details.",
          variant: "destructive",
        });
        console.error('Table creation results:', result);
      }
    } catch (error) {
      console.error('Error fixing database:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while fixing database tables.",
        variant: "destructive",
      });
    } finally {
      setIsFixing(false);
    }
  };
  
  // Check connection on component mount
  useEffect(() => {
    checkConnection();
  }, []);
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl flex items-center justify-between">
          <span>Supabase Database Status</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkConnection} 
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Refresh
          </Button>
        </CardTitle>
        <CardDescription>
          Checking connection to <code>https://ympwkvvuomlcvrptdeau.supabase.co</code>
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* Connection Status */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <span>Connection Status</span>
              {isLoading ? (
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
              ) : connectionStatus?.connected ? (
                <CheckCircle className="h-5 w-5 ml-2 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 ml-2 text-red-500" />
              )}
            </h3>
            {isLoading ? (
              <p className="text-muted-foreground">Checking database connection...</p>
            ) : connectionStatus?.connected ? (
              <p className="text-muted-foreground">Successfully connected to Supabase database.</p>
            ) : (
              <div>
                <p className="text-red-500 mb-2">Failed to connect to database.</p>
                <p className="text-muted-foreground text-sm">{connectionStatus?.error || 'Unknown error'}</p>
              </div>
            )}
          </div>
          
          {/* Tables Status */}
          {connectionStatus?.connected && tablesStatus && (
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Database Tables</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(tablesStatus).map(([table, status]: [string, any]) => (
                  <div key={table} className="flex items-center justify-between p-3 border rounded-md">
                    <span className="font-medium">{table}</span>
                    {status.exists ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                        Exists
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
                        Missing
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
              
              {Object.values(tablesStatus).some((status: any) => !status.exists) && (
                <div className="mt-4">
                  <Button 
                    variant="default" 
                    onClick={fixMissingTables} 
                    disabled={isFixing}
                  >
                    {isFixing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Create Missing Tables
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          {isLoading ? 'Checking...' : 'Last checked: ' + new Date().toLocaleTimeString()}
        </div>
      </CardFooter>
    </Card>
  );
}
