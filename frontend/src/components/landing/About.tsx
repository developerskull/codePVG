import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

const benefits = [
  'Curated problem sets designed for computer science curriculum',
  'Real-time code execution with multiple programming languages',
  'Comprehensive progress tracking and analytics',
  'Peer learning and collaborative problem-solving',
  'Regular contests and coding challenges',
  'Integration with college learning management systems',
];

const stats = [
  { label: 'Active Students', value: '1,500+' },
  { label: 'Problems Solved', value: '50,000+' },
  { label: 'Languages Supported', value: '4' },
  { label: 'Success Rate', value: '95%' },
];

export const About = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl lg:text-4xl font-bold">
                Built for Computer Science Students
              </h2>
              <p className="text-xl text-muted-foreground">
                CollegeCodeHub is specifically designed to support the learning journey of computer science students. 
                Our platform combines the best features of competitive programming sites with educational tools 
                tailored for academic success.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Why Choose CollegeCodeHub?</h3>
              <ul className="space-y-3">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Learning Today
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, index) => (
                <Card key={index}>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Platform Highlights</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Problems by Difficulty</span>
                    <div className="flex space-x-2">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Easy: 40%</span>
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Medium: 45%</span>
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Hard: 15%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Average Solve Time</span>
                    <span className="text-sm font-medium">12 minutes</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Student Satisfaction</span>
                    <span className="text-sm font-medium">4.8/5 ⭐</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
