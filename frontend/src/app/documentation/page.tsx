'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/back-button';
import { 
  BookOpen, 
  Code, 
  Users, 
  Trophy, 
  Target, 
  GraduationCap,
  Lightbulb,
  Shield,
  Globe,
  Star,
  ArrowRight,
  CheckCircle,
  Clock,
  Award,
  Zap,
  Heart,
  Brain,
  Rocket,
  Database,
  Server,
  Cpu,
  Network,
  FileText,
  Download,
  ExternalLink
} from 'lucide-react';

export default function DocumentationPage() {
  const features = [
    {
      icon: <Code className="h-8 w-8 text-primary" />,
      title: "Comprehensive Problem Set",
      description: "Access hundreds of coding problems ranging from basic to advanced algorithms, data structures, and system design challenges.",
      details: [
        "Algorithm problems (sorting, searching, graph algorithms)",
        "Data structure implementations and optimizations", 
        "Dynamic programming and greedy algorithms",
        "System design and architecture problems",
        "Database design and optimization challenges"
      ]
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "College Community",
      description: "Connect with fellow computer science students, share solutions, and learn from each other's approaches.",
      details: [
        "Student-to-student collaboration and peer learning",
        "Solution sharing and code review opportunities",
        "Study groups and team challenges",
        "Mentorship programs with senior students",
        "Campus-specific leaderboards and competitions"
      ]
    },
    {
      icon: <Trophy className="h-8 w-8 text-primary" />,
      title: "Competitive Learning",
      description: "Participate in leaderboards, track your progress, and compete with peers in a healthy learning environment.",
      details: [
        "Real-time leaderboards with multiple ranking systems",
        "Weekly and monthly coding competitions",
        "Achievement badges and progress tracking",
        "Skill-based matchmaking for fair competition",
        "Recognition for top performers and improvement"
      ]
    },
    {
      icon: <Target className="h-8 w-8 text-primary" />,
      title: "Skill Assessment",
      description: "Get detailed feedback on your solutions, understand time and space complexity, and improve your coding skills.",
      details: [
        "Automated code analysis and optimization suggestions",
        "Performance metrics and complexity analysis",
        "Personalized learning paths based on skill level",
        "Progress tracking across different problem categories",
        "Detailed solution explanations and best practices"
      ]
    },
    {
      icon: <BookOpen className="h-8 w-8 text-primary" />,
      title: "Educational Resources",
      description: "Access tutorials, explanations, and hints to help you understand concepts and solve problems effectively.",
      details: [
        "Comprehensive tutorials for all major CS topics",
        "Video explanations and interactive coding sessions",
        "Step-by-step problem-solving guides",
        "Concept explanations with visual aids",
        "Reference materials and cheat sheets"
      ]
    },
    {
      icon: <Brain className="h-8 w-8 text-primary" />,
      title: "AI-Powered Learning",
      description: "Leverage artificial intelligence to get personalized hints, solution suggestions, and adaptive learning experiences.",
      details: [
        "Smart hint system that adapts to your skill level",
        "AI-generated practice problems based on your weaknesses",
        "Intelligent code review and optimization suggestions",
        "Personalized study recommendations",
        "Natural language explanations of complex concepts"
      ]
    }
  ];

  const technicalSpecs = [
    {
      category: "Frontend Technology",
      icon: <Cpu className="h-6 w-6" />,
      items: [
        "Next.js 15 with App Router for modern React development",
        "TypeScript for type-safe development",
        "Tailwind CSS for responsive and beautiful UI",
        "shadcn/ui component library for consistent design",
        "Monaco Editor for advanced code editing experience",
        "Framer Motion for smooth animations and transitions"
      ]
    },
    {
      category: "Backend Infrastructure", 
      icon: <Server className="h-6 w-6" />,
      items: [
        "Node.js with Express.js for robust API development",
        "TypeScript for type-safe backend development",
        "PostgreSQL for reliable data storage and management",
        "Redis for high-performance caching and session management",
        "JWT-based authentication with role-based access control",
        "RESTful API design with comprehensive error handling"
      ]
    },
    {
      category: "Code Execution Engine",
      icon: <Zap className="h-6 w-6" />,
      items: [
        "Judge0 integration for secure code execution",
        "Support for 60+ programming languages",
        "Docker containerization for isolated execution",
        "Resource limits and timeout management",
        "Real-time execution monitoring and logging",
        "Batch processing for multiple test cases"
      ]
    },
    {
      category: "Database Architecture",
      icon: <Database className="h-6 w-6" />,
      items: [
        "PostgreSQL with optimized indexing for performance",
        "User management with role-based permissions",
        "Problem categorization and tagging system",
        "Submission tracking and result storage",
        "Leaderboard calculations with caching",
        "Analytics and progress tracking data"
      ]
    }
  ];

  const collegeInfo = {
    name: "CollegeCodeHub University",
    established: "2020",
    location: "Silicon Valley, California",
    students: "1,500+ Computer Science Students",
    faculty: "50+ Expert Faculty Members",
    programs: [
      "Bachelor of Science in Computer Science",
      "Master of Science in Computer Science", 
      "PhD in Computer Science",
      "Certificate Programs in Software Engineering",
      "Continuing Education in Emerging Technologies"
    ],
    achievements: [
      "Top 10 Computer Science Program in the Nation",
      "100% Job Placement Rate for Graduates",
      "Average Starting Salary: $95,000+",
      "Partnerships with 200+ Tech Companies",
      "Research Funding: $50M+ Annually"
    ]
  };

  const platformStats = [
    { label: "Active Students", value: "1,500+", icon: <Users className="h-5 w-5" /> },
    { label: "Coding Problems", value: "500+", icon: <Code className="h-5 w-5" /> },
    { label: "Languages Supported", value: "60+", icon: <Globe className="h-5 w-5" /> },
    { label: "Success Rate", value: "94%", icon: <Trophy className="h-5 w-5" /> },
    { label: "Average Score", value: "850", icon: <Star className="h-5 w-5" /> },
    { label: "Daily Submissions", value: "2,500+", icon: <Clock className="h-5 w-5" /> }
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
              <FileText className="h-4 w-4 mr-2" />
              Platform Documentation
            </Badge>
            <h1 className="text-5xl font-bold text-black">
              CollegeCodeHub Documentation
            </h1>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
              Comprehensive guide to our college coding platform, technical specifications, 
              and educational resources designed for computer science students.
            </p>
          </div>
        </div>

        {/* College Information */}
        <Card className="mb-16 border-primary/20 bg-primary/5">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl flex items-center justify-center space-x-2">
              <GraduationCap className="h-8 w-8 text-primary" />
              <span>About Our College</span>
            </CardTitle>
            <CardDescription className="text-lg">
              Excellence in Computer Science Education
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">{collegeInfo.name}</h3>
                <div className="space-y-2">
                  <p><strong>Established:</strong> {collegeInfo.established}</p>
                  <p><strong>Location:</strong> {collegeInfo.location}</p>
                  <p><strong>Students:</strong> {collegeInfo.students}</p>
                  <p><strong>Faculty:</strong> {collegeInfo.faculty}</p>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-xl font-semibold">Academic Programs</h4>
                <ul className="space-y-1">
                  {collegeInfo.programs.map((program, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>{program}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="bg-white/50 p-6 rounded-lg">
              <h4 className="text-xl font-semibold mb-4">Key Achievements</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {collegeInfo.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-yellow-600" />
                    <span>{achievement}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform Statistics */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Platform Statistics</h2>
            <p className="text-muted-foreground">
              Real-time metrics showcasing our platform's impact and usage
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {platformStats.map((stat, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-2">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
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
              Comprehensive tools and resources for computer science education
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
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-start space-x-2">
                        <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Technical Specifications */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Technical Architecture</h2>
            <p className="text-muted-foreground">
              Modern technology stack powering our educational platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {technicalSpecs.map((spec, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {spec.icon}
                    <span>{spec.category}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {spec.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Getting Started Guide */}
        <Card className="mb-16 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-800">
              <Rocket className="h-6 w-6" />
              <span>Getting Started</span>
            </CardTitle>
            <CardDescription className="text-green-700">
              Quick start guide for new students
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">For Students</h4>
                <ol className="space-y-2 text-sm">
                  <li>1. Create your account with your college email</li>
                  <li>2. Complete your profile and select your skill level</li>
                  <li>3. Start with easy problems to build confidence</li>
                  <li>4. Join study groups and connect with peers</li>
                  <li>5. Track your progress and celebrate achievements</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold mb-2">For Faculty</h4>
                <ol className="space-y-2 text-sm">
                  <li>1. Request instructor access with your credentials</li>
                  <li>2. Create custom problem sets for your courses</li>
                  <li>3. Monitor student progress and engagement</li>
                  <li>4. Generate reports and analytics</li>
                  <li>5. Integrate with your learning management system</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resources and Support */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>Learning Resources</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <ExternalLink className="h-4 w-4" />
                <span className="text-sm">Algorithm Tutorials</span>
              </div>
              <div className="flex items-center space-x-2">
                <ExternalLink className="h-4 w-4" />
                <span className="text-sm">Data Structure Guides</span>
              </div>
              <div className="flex items-center space-x-2">
                <ExternalLink className="h-4 w-4" />
                <span className="text-sm">System Design Patterns</span>
              </div>
              <div className="flex items-center space-x-2">
                <ExternalLink className="h-4 w-4" />
                <span className="text-sm">Interview Preparation</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Community Support</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <ExternalLink className="h-4 w-4" />
                <span className="text-sm">Student Forums</span>
              </div>
              <div className="flex items-center space-x-2">
                <ExternalLink className="h-4 w-4" />
                <span className="text-sm">Study Groups</span>
              </div>
              <div className="flex items-center space-x-2">
                <ExternalLink className="h-4 w-4" />
                <span className="text-sm">Peer Mentoring</span>
              </div>
              <div className="flex items-center space-x-2">
                <ExternalLink className="h-4 w-4" />
                <span className="text-sm">Faculty Office Hours</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Technical Support</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <ExternalLink className="h-4 w-4" />
                <span className="text-sm">Help Documentation</span>
              </div>
              <div className="flex items-center space-x-2">
                <ExternalLink className="h-4 w-4" />
                <span className="text-sm">Video Tutorials</span>
              </div>
              <div className="flex items-center space-x-2">
                <ExternalLink className="h-4 w-4" />
                <span className="text-sm">Live Chat Support</span>
              </div>
              <div className="flex items-center space-x-2">
                <ExternalLink className="h-4 w-4" />
                <span className="text-sm">Bug Reports</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
