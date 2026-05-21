import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { navItems } from '@/components/layout/AppSidebar';

interface ProtectedRouteProps {
  children: React.ReactNode;
  permissionKey: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, permissionKey }) => {
  const { canAccess, isLoading } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return null; // Will show the loader at simpleAuth level
  }

  const hasAccess = canAccess(permissionKey, 'view');

  const handleBackToDashboard = () => {
    // Find the first module in navItems that the user can access
    const firstAllowedItem = navItems.find(item => 
      !item.permissionKey || canAccess(item.permissionKey, 'view')
    );
    
    if (firstAllowedItem) {
      navigate(firstAllowedItem.path);
    } else {
      navigate('/');
    }
  };

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center font-['Inter']">
        <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6 animate-bounce">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-extrabold font-['Plus_Jakarta_Sans'] tracking-tight text-foreground mb-3">
          Access Denied
        </h1>
        <p className="text-muted-foreground text-base max-w-md mb-8 leading-relaxed">
          You do not have the required permissions to view the <span className="font-semibold text-foreground">"{permissionKey.replace('_', ' ')}"</span> module. Please contact your system administrator if you believe this is an error.
        </p>
        <Button 
          onClick={handleBackToDashboard}
          className="flex items-center gap-2 px-6 h-12 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return <>{children}</>;
};
