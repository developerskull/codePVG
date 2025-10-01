'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Code, Users, Trophy, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
                Master Coding with{' '}
                <span className="text-blue-600">CollegeCodeHub</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl">
                A comprehensive coding platform designed specifically for computer science students. 
                Practice, compete, and grow with 1000+ problems and real-time code execution.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/problems">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Browse Problems
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">1000+</div>
                <div className="text-sm text-gray-600">Problems</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">1500+</div>
                <div className="text-sm text-gray-600">Students</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">4</div>
                <div className="text-sm text-gray-600">Languages</div>
              </div>
            </div>
          </motion.div>

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-white rounded-lg shadow-2xl p-6 border border-gray-200">
              <div className="space-y-4">
                {/* Code Editor Mockup */}
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 ml-2">Two Sum - Python</span>
                  </div>
                  <pre className="text-sm font-mono text-gray-900">
{`def twoSum(nums, target):
    hashmap = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in hashmap:
            return [hashmap[complement], i]
        hashmap[num] = i
    return []`}
                  </pre>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2 p-3 bg-gray-100 rounded-lg">
                    <Code className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium">Real-time Execution</span>
                  </div>
                  <div className="flex items-center space-x-2 p-3 bg-gray-100 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium">Peer Learning</span>
                  </div>
                  <div className="flex items-center space-x-2 p-3 bg-gray-100 rounded-lg">
                    <Trophy className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium">Leaderboards</span>
                  </div>
                  <div className="flex items-center space-x-2 p-3 bg-gray-100 rounded-lg">
                    <Zap className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium">Fast Feedback</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-4 -right-4 bg-blue-600 text-white rounded-full p-3 shadow-lg"
            >
              <Trophy className="h-6 w-6" />
            </motion.div>
            
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              className="absolute -bottom-4 -left-4 bg-gray-600 text-white rounded-full p-3 shadow-lg"
            >
              <Code className="h-6 w-6" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
