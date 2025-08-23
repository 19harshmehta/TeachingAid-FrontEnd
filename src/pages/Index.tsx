import LandingPage from '@/components/LandingPage';

// Define an interface for the props that App.tsx will pass down.
interface IndexProps {
  installPrompt: Event | null;
  onInstall: () => void;
}

// Update the component to accept these props and apply the types.
const Index = ({ installPrompt, onInstall }: IndexProps) => {
  // Pass the received props down to the LandingPage component.
  return <LandingPage installPrompt={installPrompt} onInstall={onInstall} />;
};

export default Index;
