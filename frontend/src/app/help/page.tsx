'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/back-button';
import { 
  HelpCircle, 
  Code, 
  Users, 
  Trophy, 
  BookOpen, 
  Settings,
  Play,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  Clock,
  Target,
  Zap
} from 'lucide-react';

export default function HelpPage() {
  const quickStart = [
    {
      step: 1,
      title: "Create Account",
      description: "Sign up with your college email address",
      icon: <Users className="h-5 w-5" />
    },
    {
      step: 2,
      title: "Complete Profile",
      description: "Set your skill level and programming preferences",
      icon: <Settings className="h-5 w-5" />
    },
    {
      step: 3,
      title: "Start Coding",
      description: "Begin with easy problems and work your way up",
      icon: <Code className="h-5 w-5" />
    },
    {
      step: 4,
      title: "Track Progress",
      description: "Monitor your achievements and improvement",
      icon: <Trophy className="h-5 w-5" />
    }
  ];

  const features = [
    {
      title: "Problem Solving",
      icon: <Code className="h-6 w-6" />,
      steps: [
        "Browse problems by difficulty (Easy, Medium, Hard)",
        "Filter by topic (Array, String, Tree, etc.)",
        "Read problem description and examples",
        "Write your solution in the code editor",
        "Test with provided test cases",
        "Submit and get instant feedback"
      ]
    },
    {
      title: "Leaderboard",
      icon: <Trophy className="h-6 w-6" />,
      steps: [
        "View your ranking among all students",
        "Check your score and problems solved",
        "Compare with friends and classmates",
        "Track your progress over time"
      ]
    },
    {
      title: "Dashboard",
      icon: <Target className="h-6 w-6" />,
      steps: [
        "View your coding statistics",
        "See recent submissions and results",
        "Track your learning progress",
        "Access personalized recommendations"
      ]
    }
  ];

  const tips = [
    {
      icon: <Lightbulb className="h-5 w-5 text-yellow-500" />,
      title: "Start with Easy Problems",
      description: "Build confidence by solving easier problems first"
    },
    {
      icon: <Clock className="h-5 w-5 text-blue-500" />,
      title: "Practice Regularly",
      description: "Consistent practice is key to improvement"
    },
    {
      icon: <BookOpen className="h-5 w-5 text-green-500" />,
      title: "Read Solutions",
      description: "Learn from others' approaches and solutions"
    },
    {
      icon: <Zap className="h-5 w-5 text-purple-500" />,
      title: "Use Hints",
      description: "Don't hesitate to use hints when stuck"
    }
  ];

  const faq = [
    {
      question: "How do I submit my code?",
      answer: "Write your solution in the code editor, test it with the provided test cases, then click the 'Submit' button to get your results."
    },
    {
      question: "What programming languages are supported?",
      answer: "We support 60+ programming languages including Python, Java, C++, JavaScript, and many more."
    },
    {
      question: "How is my score calculated?",
      answer: "Your score is based on the number of problems solved, difficulty level, and time taken to solve them."
    },
    {
      question: "Can I see other students' solutions?",
      answer: "Yes, after solving a problem, you can view other students' solutions to learn different approaches."
    },
    {
      question: "How do I track my progress?",
      answer: "Visit your dashboard to see your statistics, recent submissions, and progress over time."
    },
    {
      question: "What if I get stuck on a problem?",
      answer: "Use the hint system, read the problem discussion, or ask for help in the community forums."
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
              <HelpCircle className="h-4 w-4 mr-2" />
              Help Center
            </Badge>
            <h1 className="text-4xl font-bold text-black">
              How to Use CollegeCodeHub
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Quick guide to get started with our coding platform and make the most of your learning experience.
            </p>
          </div>
        </div>

        {/* Quick Start Guide */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Quick Start Guide</h2>
            <p className="text-muted-foreground">
              Get up and running in just a few simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickStart.map((step, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      {step.icon}
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-primary mb-2">Step {step.step}</div>
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Platform Features */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Platform Features</h2>
            <p className="text-muted-foreground">
              Learn how to use each feature effectively
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {feature.icon}
                    <span>{feature.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-2">
                    {feature.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="flex items-start space-x-2">
                        <span className="text-primary font-semibold">{stepIndex + 1}.</span>
                        <span className="text-sm">{step}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Tips for Success */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Tips for Success</h2>
            <p className="text-muted-foreground">
              Best practices to maximize your learning
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tips.map((tip, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    {tip.icon}
                  </div>
                  <h3 className="font-semibold mb-2">{tip.title}</h3>
                  <p className="text-sm text-muted-foreground">{tip.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">
              Quick answers to common questions
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faq.map((item, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-start space-x-2">
                      <HelpCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>{item.question}</span>
                    </h3>
                    <p className="text-sm text-muted-foreground ml-7">{item.answer}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Getting Help */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-800">
              <HelpCircle className="h-6 w-6" />
              <span>Need More Help?</span>
            </CardTitle>
            <CardDescription className="text-blue-700">
              Additional resources and support options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-semibold mb-2">Documentation</h4>
                <p className="text-sm text-muted-foreground">Comprehensive guides and tutorials</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-semibold mb-2">Community</h4>
                <p className="text-sm text-muted-foreground">Ask questions and get help from peers</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Settings className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-semibold mb-2">Support</h4>
                <p className="text-sm text-muted-foreground">Contact our technical support team</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
