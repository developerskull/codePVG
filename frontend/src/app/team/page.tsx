'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/back-button';
import { 
  Users, 
  Award, 
  BookOpen, 
  Code, 
  Heart,
  GraduationCap,
  Lightbulb,
  Globe,
  Star,
  Mail,
  Linkedin,
  Github,
  ExternalLink
} from 'lucide-react';

export default function TeamPage() {
  const teamMembers = [
    {
      name: "Dr. Sarah Chen",
      role: "Chief Academic Officer",
      university: "Massachusetts Institute of Technology",
      department: "Computer Science & Artificial Intelligence",
      expertise: ["Machine Learning", "Algorithms", "Educational Technology"],
      bio: "Leading researcher in AI education with 15+ years of experience in developing innovative learning platforms for computer science students.",
      avatar: "👩‍💼",
      email: "sarah.chen@collegecodehub.edu",
      linkedin: "https://linkedin.com/in/sarahchen-mit",
      github: "https://github.com/sarahchen-ai",
      achievements: ["IEEE Fellow", "ACM Distinguished Educator", "MIT Teaching Excellence Award"]
    },
    {
      name: "Prof. Michael Rodriguez",
      role: "Head of Engineering",
      university: "Stanford University",
      department: "Computer Science",
      expertise: ["System Design", "Distributed Systems", "Software Architecture"],
      bio: "Former Google engineer turned educator, specializing in scalable systems and mentoring the next generation of software engineers.",
      avatar: "👨‍💻",
      email: "michael.rodriguez@collegecodehub.edu",
      linkedin: "https://linkedin.com/in/michaelrodriguez-stanford",
      github: "https://github.com/mrodriguez-systems",
      achievements: ["Google Distinguished Engineer", "Stanford Innovation Award", "ACM Senior Member"]
    },
    {
      name: "Dr. Emily Johnson",
      role: "Director of Learning Analytics",
      university: "University of California, Berkeley",
      department: "Education & Computer Science",
      expertise: ["Learning Analytics", "Educational Assessment", "Data Science"],
      bio: "Pioneer in educational data science, developing cutting-edge methods to measure and improve student learning outcomes in programming education.",
      avatar: "👩‍🎓",
      email: "emily.johnson@collegecodehub.edu",
      linkedin: "https://linkedin.com/in/emilyjohnson-berkeley",
      github: "https://github.com/emilyjohnson-edtech",
      achievements: ["NSF CAREER Award", "Berkeley Excellence in Teaching", "AERA Outstanding Research"]
    },
    {
      name: "Alex Thompson",
      role: "Lead Platform Developer",
      university: "Carnegie Mellon University",
      department: "Software Engineering",
      expertise: ["Full-Stack Development", "DevOps", "Cloud Architecture"],
      bio: "Full-stack developer with expertise in modern web technologies, passionate about creating seamless learning experiences for students worldwide.",
      avatar: "👨‍🔬",
      email: "alex.thompson@collegecodehub.edu",
      linkedin: "https://linkedin.com/in/alexthompson-cmu",
      github: "https://github.com/alexthompson-dev",
      achievements: ["CMU Outstanding Graduate", "AWS Solutions Architect", "Open Source Contributor"]
    },
    {
      name: "Dr. Priya Patel",
      role: "Head of Content Strategy",
      university: "University of Washington",
      department: "Computer Science Education",
      expertise: ["Curriculum Design", "Problem Creation", "Educational Content"],
      bio: "Expert in computer science curriculum development, creating comprehensive problem sets that challenge and inspire students at all levels.",
      avatar: "👩‍🏫",
      email: "priya.patel@collegecodehub.edu",
      linkedin: "https://linkedin.com/in/priyapatel-uw",
      github: "https://github.com/priyapatel-content",
      achievements: ["UW Teaching Innovation Award", "ACM Curriculum Committee", "Author of 'Algorithms for All'"]
    },
    {
      name: "James Wilson",
      role: "Community Manager",
      university: "Georgia Institute of Technology",
      department: "Computer Science",
      expertise: ["Community Building", "Student Engagement", "Event Management"],
      bio: "Dedicated to fostering inclusive learning communities and ensuring every student feels supported in their coding journey.",
      avatar: "👨‍🎓",
      email: "james.wilson@collegecodehub.edu",
      linkedin: "https://linkedin.com/in/jameswilson-gatech",
      github: "https://github.com/jameswilson-community",
      achievements: ["Georgia Tech Leadership Award", "Student Choice Award", "Community Builder of the Year"]
    }
  ];

  const departments = [
    {
      name: "Academic Leadership",
      description: "Leading research and curriculum development",
      members: 3,
      icon: <GraduationCap className="h-6 w-6" />
    },
    {
      name: "Engineering",
      description: "Building and maintaining our platform",
      members: 2,
      icon: <Code className="h-6 w-6" />
    },
    {
      name: "Content & Community",
      description: "Creating educational content and fostering community",
      members: 1,
      icon: <Users className="h-6 w-6" />
    }
  ];

  const values = [
    {
      title: "Student-First Approach",
      description: "Every decision we make prioritizes student learning and success",
      icon: <Heart className="h-8 w-8 text-red-500" />
    },
    {
      title: "Innovation in Education",
      description: "Continuously improving how computer science is taught and learned",
      icon: <Lightbulb className="h-8 w-8 text-yellow-500" />
    },
    {
      title: "Inclusive Community",
      description: "Creating welcoming spaces for students from all backgrounds",
      icon: <Globe className="h-8 w-8 text-blue-500" />
    },
    {
      title: "Academic Excellence",
      description: "Maintaining the highest standards in educational content",
      icon: <Award className="h-8 w-8 text-purple-500" />
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
              <Users className="h-4 w-4 mr-2" />
              Our Team
            </Badge>
            <h1 className="text-5xl font-bold text-black">
              Meet Our Team
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Passionate educators, engineers, and innovators dedicated to transforming 
              computer science education for college students worldwide.
            </p>
          </div>
        </div>

        {/* Team Values */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <p className="text-muted-foreground">
              The principles that guide our work and define our culture
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    {value.icon}
                  </div>
                  <CardTitle className="text-lg">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {value.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Departments */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Departments</h2>
            <p className="text-muted-foreground">
              How we organize our expertise to serve students better
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {departments.map((dept, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      {dept.icon}
                    </div>
                  </div>
                  <CardTitle className="text-xl">{dept.name}</CardTitle>
                  <CardDescription className="text-base">
                    {dept.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    {dept.members} team member{dept.members !== 1 ? 's' : ''}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Team Members */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Team Members</h2>
            <p className="text-muted-foreground">
              Meet the people behind College Code Hub
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="text-6xl mb-4">{member.avatar}</div>
                  <CardTitle className="text-xl">{member.name}</CardTitle>
                  <CardDescription className="font-medium text-primary">
                    {member.role}
                  </CardDescription>
                  <div className="text-sm text-muted-foreground">
                    {member.university}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {member.department}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Expertise:</h4>
                    <div className="flex flex-wrap gap-1">
                      {member.expertise.map((skill, skillIndex) => (
                        <Badge key={skillIndex} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Bio:</h4>
                    <p className="text-sm text-muted-foreground">
                      {member.bio}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Achievements:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {member.achievements.map((achievement, achIndex) => (
                        <li key={achIndex} className="flex items-center">
                          <Star className="h-3 w-3 text-yellow-500 mr-2" />
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex space-x-2 pt-4">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Linkedin className="h-4 w-4 mr-2" />
                      LinkedIn
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Github className="h-4 w-4 mr-2" />
                      GitHub
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Join Our Team */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="text-center py-12">
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Join Our Mission</h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  We're always looking for passionate educators, engineers, and innovators 
                  who share our vision of transforming computer science education.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-lg px-8">
                  <ExternalLink className="h-5 w-5 mr-2" />
                  View Open Positions
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8">
                  <Mail className="h-5 w-5 mr-2" />
                  Contact Us
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
