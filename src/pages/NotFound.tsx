import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageTransition } from '@/components/layout/PageTransition';

const NotFound = () => {
  return (
    <PageTransition>
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-background">
        <div className="text-center space-y-6 px-4 max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <Search className="h-10 w-10 text-primary" />
          </div>
          <div>
            <h1 className="text-6xl font-bold text-gradient-primary mb-2">404</h1>
            <p className="text-lg text-muted-foreground">
              This page doesn't exist or has been moved.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="default" className="gap-2">
              <Link to="/">
                <Home className="h-4 w-4" />
                Go to Dashboard
              </Link>
            </Button>
            <Button asChild variant="outline" className="gap-2" onClick={() => window.history.back()}>
              <span className="cursor-pointer">
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </span>
            </Button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default NotFound;
