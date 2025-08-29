import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Users, TrendingUp } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-subtle overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Students collaborating in academic environment"
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-hero opacity-5"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent">
            Welcome to SaiU LMS
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-4">
            An initiative for SaiU by SaiU students
          </p>
          
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            A comprehensive learning management system designed to enhance education 
            for students, professors, and administrators with modern tools and analytics.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button variant="hero" size="xl" className="group">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button variant="outline" size="xl">
              Learn More
            </Button>
          </div>

          {/* Feature highlights */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-card/50 backdrop-blur rounded-lg p-6 shadow-card border">
              <div className="bg-primary-light rounded-lg p-3 w-fit mb-4 mx-auto">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Course Management</h3>
              <p className="text-muted-foreground">
                Create, manage, and track courses with ease
              </p>
            </div>

            <div className="bg-card/50 backdrop-blur rounded-lg p-6 shadow-card border">
              <div className="bg-accent-light rounded-lg p-3 w-fit mb-4 mx-auto">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Collaborative Learning</h3>
              <p className="text-muted-foreground">
                Connect students and professors seamlessly
              </p>
            </div>

            <div className="bg-card/50 backdrop-blur rounded-lg p-6 shadow-card border">
              <div className="bg-primary-light rounded-lg p-3 w-fit mb-4 mx-auto">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Analytics & Insights</h3>
              <p className="text-muted-foreground">
                Track performance with detailed analytics
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;