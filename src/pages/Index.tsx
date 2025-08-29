import LMSHeader from "@/components/LMSHeader";
import HeroSection from "@/components/HeroSection";
import AuthSection from "@/components/AuthSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <LMSHeader />
      <main>
        <HeroSection />
        <AuthSection />
      </main>
    </div>
  );
};

export default Index;