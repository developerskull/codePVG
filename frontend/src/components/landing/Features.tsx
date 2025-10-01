import { Code, Users, Trophy, Zap, Shield, BookOpen } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    icon: Code,
    title: 'Real-time Code Execution',
    description: 'Write and test your code instantly with our integrated Judge0 execution environment supporting Python, Java, C++, and C.',
  },
  {
    icon: Users,
    title: 'Peer Learning',
    description: 'Learn from your classmates through collaborative problem-solving and shared solutions in a supportive environment.',
  },
  {
    icon: Trophy,
    title: 'Competitive Programming',
    description: 'Compete with fellow students on our leaderboards and track your progress with detailed analytics and achievements.',
  },
  {
    icon: Zap,
    title: 'Fast Feedback',
    description: 'Get immediate feedback on your submissions with detailed error messages and performance metrics.',
  },
  {
    icon: Shield,
    title: 'Secure Environment',
    description: 'Practice in a secure, isolated environment with role-based access control and comprehensive security measures.',
  },
  {
    icon: BookOpen,
    title: 'Comprehensive Learning',
    description: 'Access a curated collection of problems covering all major computer science topics and difficulty levels.',
  },
];

export const Features = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold">
            Everything you need to master coding
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our platform provides all the tools and resources you need to become a better programmer, 
            from beginner to advanced levels.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
