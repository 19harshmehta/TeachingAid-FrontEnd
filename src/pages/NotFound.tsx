
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const isPollRoute = location.pathname.startsWith('/poll/');
  const pollCode = isPollRoute ? location.pathname.split('/poll/')[1] : null;

  return (
    <div className="min-h-screen bg-gradient-main flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">404</h1>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
          
          {isPollRoute && pollCode ? (
            <div className="mb-6">
              <p className="text-gray-600 mb-2">
                The poll you're looking for might not exist or has been removed.
              </p>
              <p className="text-sm text-gray-500">
                Poll Code: <span className="font-mono font-bold">{pollCode}</span>
              </p>
            </div>
          ) : (
            <p className="text-gray-600 mb-6">
              The page you're looking for doesn't exist.
            </p>
          )}
          
          <div className="space-y-3">
            {isPollRoute ? (
              <Button
                onClick={() => navigate('/join')}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Join Another Poll
              </Button>
            ) : (
              <Button
                onClick={() => navigate('/')}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
