import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, UserPlus, Shield, Users, GraduationCap } from "lucide-react";

const AuthSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Access Your Learning Platform
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose your role to access the tailored features designed for your needs
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Login Card */}
          <Card className="shadow-elegant hover:shadow-hover transition-smooth">
            <CardHeader className="text-center">
              <div className="bg-primary-light rounded-lg p-3 w-fit mb-4 mx-auto">
                <LogIn className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Login</CardTitle>
              <CardDescription className="text-base">
                Access your existing account as a student, professor, or admin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <span className="text-xs font-medium">Students</span>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <GraduationCap className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <span className="text-xs font-medium">Professors</span>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <Shield className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <span className="text-xs font-medium">Admin</span>
                </div>
              </div>
              <Button className="w-full" size="lg" variant="hero">
                <LogIn className="mr-2 h-5 w-5" />
                Login to Account
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Forgot your password? <a href="#" className="text-primary hover:underline">Reset here</a>
              </p>
            </CardContent>
          </Card>

          {/* Sign Up Card */}
          <Card className="shadow-elegant hover:shadow-hover transition-smooth border-primary/20">
            <CardHeader className="text-center">
              <div className="bg-accent-light rounded-lg p-3 w-fit mb-4 mx-auto">
                <UserPlus className="h-8 w-8 text-accent" />
              </div>
              <CardTitle className="text-2xl">Sign Up</CardTitle>
              <CardDescription className="text-base">
                Admin registration to set up your institution
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-accent-light/50 p-4 rounded-lg border border-accent/20">
                <div className="flex items-center mb-2">
                  <Shield className="h-5 w-5 text-accent mr-2" />
                  <span className="font-semibold text-accent">Admin Only</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Only administrators can create new accounts. Once registered, 
                  you can add students and professors to your platform.
                </p>
              </div>
              <Button className="w-full" size="lg" variant="success">
                <UserPlus className="mr-2 h-5 w-5" />
                Register as Admin
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                After registration, you can manage all users and courses
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <div className="bg-muted/50 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="font-semibold mb-2">New to SaiU LMS?</h3>
            <p className="text-sm text-muted-foreground">
              If you don't have an account, contact your institution's administrator 
              or register as an admin to get started with your learning platform.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuthSection;