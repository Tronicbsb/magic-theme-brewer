import { Navigation } from '@/components/Navigation';
import DrawPage from './DrawPage';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <DrawPage />
    </div>
  );
};

export default Index;
