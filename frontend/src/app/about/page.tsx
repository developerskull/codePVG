'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/back-button';
import { 
  Code, 
  Users, 
  Trophy, 
  Target, 
  BookOpen, 
  Zap, 
  Shield, 
  Heart,
  GraduationCap,
  Lightbulb,
  Globe,
  Star
} from 'lucide-react';

export default function AboutPage() {
  const features = [
    {
      icon: <Code className="h-8 w-8 text-primary" />,
      title: "Comprehensive Problem Set",
      description: "Access hundreds of coding problems ranging from basic to advanced algorithms, data structures, and system design."
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "College Community",
      description: "Connect with fellow computer science students, share solutions, and learn from each other's approaches."
    },
    {
      icon: <Trophy className="h-8 w-8 text-primary" />,
      title: "Competitive Learning",
      description: "Participate in leaderboards, track your progress, and compete with peers in a healthy learning environment."
    },
    {
      icon: <Target className="h-8 w-8 text-primary" />,
      title: "Skill Assessment",
      description: "Get detailed feedback on your solutions, understand time and space complexity, and improve your coding skills."
    },
    {
      icon: <BookOpen className="h-8 w-8 text-primary" />,
      title: "Educational Resources",
      description: "Access tutorials, explanations, and hints to help you understand concepts and solve problems effectively."
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "Real-time Coding",
      description: "Practice with our integrated code editor supporting multiple programming languages with syntax highlighting."
    }
  ];

  const stats = [
    { label: "Active Students", value: "2,500+" },
    { label: "Problems Solved", value: "50,000+" },
    { label: "Programming Languages", value: "10+" },
    { label: "Colleges Participating", value: "150+" }
  ];

  const team = [
    {
      name: "Dr. Sarah Chen",
      role: "Computer Science Professor",
      university: "MIT",
      expertise: "Algorithms & Data Structures",
      avatar: "👩‍💼"
    },
    {
      name: "Prof. Michael Rodriguez",
      role: "Software Engineering",
      university: "Stanford",
      expertise: "System Design & Architecture",
      avatar: "👨‍💻"
    },
    {
      name: "Dr. Emily Johnson",
      role: "Educational Technology",
      university: "Berkeley",
      expertise: "Learning Analytics & Assessment",
      avatar: "👩‍🎓"
    },
    {
      name: "Alex Thompson",
      role: "Platform Lead",
      university: "Carnegie Mellon",
      expertise: "Full-Stack Development",
      avatar: "👨‍🔬"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="space-y-8 mb-16">
          <div className="flex items-center justify-between">
            <BackButton />
            <div></div>
          </div>
          <div className="text-center space-y-4">
            <Badge variant="secondary" className="text-sm">
              <GraduationCap className="h-4 w-4 mr-2" />
              College Code Hub
            </Badge>
            <h1 className="text-5xl font-bold text-black">
              About Our Platform
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Empowering computer science students with a comprehensive coding platform 
              designed specifically for college-level learning and competition.
            </p>
          </div>
        </div>

        {/* Mission Statement */}
        <Card className="mb-16 border-primary/20 bg-primary/5">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl flex items-center justify-center space-x-2">
              <Target className="h-8 w-8 text-primary" />
              <span>Our Mission</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-lg text-muted-foreground max-w-4xl mx-auto">
              To create an inclusive, educational coding platform that bridges the gap between 
              theoretical computer science knowledge and practical programming skills. We believe 
              that every computer science student deserves access to high-quality, college-specific 
              coding challenges that prepare them for real-world software development.
            </p>
            <div className="flex items-center justify-center space-x-2 text-primary">
              <Heart className="h-5 w-5" />
              <span className="font-semibold">Built with passion for education</span>
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Platform Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to excel in computer science and programming
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    {feature.icon}
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Statistics */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Platform Impact</h2>
            <p className="text-muted-foreground">
              Numbers that reflect our growing community and success
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
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
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Team</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Computer science educators and industry professionals dedicated to student success
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="text-4xl mb-4">{member.avatar}</div>
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <CardDescription className="font-medium">{member.role}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm text-primary font-semibold">
                    {member.university}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {member.expertise}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <p className="text-muted-foreground">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Academic Integrity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We promote honest learning and discourage cheating, 
                  focusing on genuine skill development.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <Globe className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Inclusive Learning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our platform welcomes students from all backgrounds, 
                  creating an environment where everyone can thrive.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <Lightbulb className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Innovation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We continuously improve our platform with the latest 
                  educational technology and teaching methods.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="text-center py-12">
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Ready to Start Your Journey?</h3>
                <p className="text-muted-foreground">
                  Join thousands of computer science students already using our platform
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-lg px-8">
                  <Star className="h-5 w-5 mr-2" />
                  Get Started Today
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8">
                  Learn More
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
