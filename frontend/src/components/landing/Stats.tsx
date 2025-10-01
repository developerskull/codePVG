import { TrendingUp, Users, Code, Trophy } from 'lucide-react';

const stats = [
  {
    icon: Users,
    label: 'Active Students',
    value: '1,500+',
    description: 'Students actively using the platform',
  },
  {
    icon: Code,
    label: 'Problems Solved',
    value: '50,000+',
    description: 'Total problems solved by students',
  },
  {
    icon: Trophy,
    label: 'Contests Hosted',
    value: '25+',
    description: 'Monthly coding contests and challenges',
  },
  {
    icon: TrendingUp,
    label: 'Success Rate',
    value: '95%',
    description: 'Students who improve their coding skills',
  },
];

export const Stats = () => {
  return (
    <section className="py-20 bg-primary/5">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold">
            Trusted by Computer Science Students
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join thousands of students who are already improving their coding skills with CollegeCodeHub
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <stat.icon className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-primary">
                  {stat.value}
                </div>
                <div className="text-lg font-semibold">
                  {stat.label}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.description}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional metrics */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center space-y-2">
            <div className="text-2xl font-bold text-primary">4</div>
            <div className="text-sm text-muted-foreground">Programming Languages</div>
          </div>
          <div className="text-center space-y-2">
            <div className="text-2xl font-bold text-primary">15+</div>
            <div className="text-sm text-muted-foreground">CS Topics Covered</div>
          </div>
          <div className="text-center space-y-2">
            <div className="text-2xl font-bold text-primary">24/7</div>
            <div className="text-sm text-muted-foreground">Platform Availability</div>
          </div>
        </div>
      </div>
    </section>
  );
};
