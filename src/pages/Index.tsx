import LandingPage from '@/components/LandingPage';

interface IndexProps {
  installPrompt: Event | null;
  onInstall: () => void;
}

const Index = ({ installPrompt, onInstall }: IndexProps) => {
  return <LandingPage installPrompt={installPrompt} onInstall={onInstall} />;
};

export default Index;