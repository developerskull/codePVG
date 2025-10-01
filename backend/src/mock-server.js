const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data with comprehensive problems organized by topics
const mockProblems = [
  {
    id: 1,
    title: "Two Sum",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    difficulty: "easy",
    topic: "Array",
    subtopic: "Hash Table",
    tags: ["array", "hash-table", "two-pointers"],
    acceptance_rate: 45.2,
    submissions: 1250,
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      }
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9"
    ],
    test_cases: [
      { input: "[2,7,11,15]", target: 9, expected: "[0,1]" },
      { input: "[3,2,4]", target: 6, expected: "[1,2]" },
      { input: "[3,3]", target: 6, expected: "[0,1]" }
    ],
    created_at: "2024-01-01T00:00:00Z"
  },
  {
    id: 2,
    title: "Add Two Numbers",
    description: "You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.",
    difficulty: "medium",
    topic: "Linked List",
    subtopic: "Math",
    tags: ["linked-list", "math", "recursion"],
    acceptance_rate: 34.8,
    submissions: 890,
    examples: [
      {
        input: "l1 = [2,4,3], l2 = [5,6,4]",
        output: "[7,0,8]",
        explanation: "342 + 465 = 807."
      }
    ],
    constraints: [
      "The number of nodes in each linked list is in the range [1, 100].",
      "0 <= Node.val <= 9",
      "It is guaranteed that the list represents a number that does not have leading zeros."
    ],
    test_cases: [
      { input: "[2,4,3]", l2: "[5,6,4]", expected: "[7,0,8]" },
      { input: "[0]", l2: "[0]", expected: "[0]" },
      { input: "[9,9,9,9,9,9,9]", l2: "[9,9,9,9]", expected: "[8,9,9,9,0,0,0,1]" }
    ],
    created_at: "2024-01-02T00:00:00Z"
  },
  {
    id: 3,
    title: "Longest Substring Without Repeating Characters",
    description: "Given a string s, find the length of the longest substring without repeating characters.",
    difficulty: "medium",
    topic: "String",
    subtopic: "Sliding Window",
    tags: ["string", "sliding-window", "hash-table"],
    acceptance_rate: 31.2,
    submissions: 2100,
    examples: [
      {
        input: "s = \"abcabcbb\"",
        output: "3",
        explanation: "The answer is \"abc\", with the length of 3."
      }
    ],
    constraints: [
      "0 <= s.length <= 5 * 10^4",
      "s consists of English letters, digits, symbols and spaces."
    ],
    test_cases: [
      { input: "\"abcabcbb\"", expected: "3" },
      { input: "\"bbbbb\"", expected: "1" },
      { input: "\"pwwkew\"", expected: "3" }
    ],
    created_at: "2024-01-03T00:00:00Z"
  },
  {
    id: 4,
    title: "Median of Two Sorted Arrays",
    description: "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.",
    difficulty: "hard",
    topic: "Array",
    subtopic: "Binary Search",
    tags: ["array", "binary-search", "divide-conquer"],
    acceptance_rate: 28.5,
    submissions: 450,
    examples: [
      {
        input: "nums1 = [1,3], nums2 = [2]",
        output: "2.00000",
        explanation: "merged array = [1,2,3] and median is 2."
      }
    ],
    constraints: [
      "nums1.length == m",
      "nums2.length == n",
      "0 <= m <= 1000",
      "0 <= n <= 1000",
      "1 <= m + n <= 2000"
    ],
    test_cases: [
      { input: "[1,3], [2]", expected: "2.00000" },
      { input: "[1,2], [3,4]", expected: "2.50000" }
    ],
    created_at: "2024-01-04T00:00:00Z"
  },
  {
    id: 5,
    title: "Valid Parentheses",
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    difficulty: "easy",
    topic: "String",
    subtopic: "Stack",
    tags: ["string", "stack"],
    acceptance_rate: 38.7,
    submissions: 1800,
    examples: [
      {
        input: "s = \"()\"",
        output: "true",
        explanation: "The string is valid."
      }
    ],
    constraints: [
      "1 <= s.length <= 10^4",
      "s consists of parentheses only '()[]{}'."
    ],
    test_cases: [
      { input: "\"()\"", expected: "true" },
      { input: "\"()[]{}\"", expected: "true" },
      { input: "\"(]\"", expected: "false" }
    ],
    created_at: "2024-01-05T00:00:00Z"
  },
  {
    id: 6,
    title: "Binary Tree Inorder Traversal",
    description: "Given the root of a binary tree, return the inorder traversal of its nodes' values.",
    difficulty: "easy",
    topic: "Tree",
    subtopic: "Depth-First Search",
    tags: ["tree", "dfs", "stack"],
    acceptance_rate: 67.8,
    submissions: 3200,
    examples: [
      {
        input: "root = [1,null,2,3]",
        output: "[1,3,2]",
        explanation: "Inorder traversal: left -> root -> right"
      }
    ],
    constraints: [
      "The number of nodes in the tree is in the range [0, 100].",
      "-100 <= Node.val <= 100"
    ],
    test_cases: [
      { input: "[1,null,2,3]", expected: "[1,3,2]" },
      { input: "[]", expected: "[]" },
      { input: "[1]", expected: "[1]" }
    ],
    created_at: "2024-01-06T00:00:00Z"
  },
  {
    id: 7,
    title: "Maximum Subarray",
    description: "Given an integer array nums, find the subarray with the largest sum, and return its sum.",
    difficulty: "medium",
    topic: "Array",
    subtopic: "Dynamic Programming",
    tags: ["array", "dp", "divide-conquer"],
    acceptance_rate: 48.3,
    submissions: 2800,
    examples: [
      {
        input: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
        output: "6",
        explanation: "The subarray [4,-1,2,1] has the largest sum 6."
      }
    ],
    constraints: [
      "1 <= nums.length <= 10^5",
      "-10^4 <= nums[i] <= 10^4"
    ],
    test_cases: [
      { input: "[-2,1,-3,4,-1,2,1,-5,4]", expected: "6" },
      { input: "[1]", expected: "1" },
      { input: "[5,4,-1,7,8]", expected: "23" }
    ],
    created_at: "2024-01-07T00:00:00Z"
  },
  {
    id: 8,
    title: "Climbing Stairs",
    description: "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
    difficulty: "easy",
    topic: "Dynamic Programming",
    subtopic: "Math",
    tags: ["dp", "math", "memoization"],
    acceptance_rate: 52.1,
    submissions: 4100,
    examples: [
      {
        input: "n = 2",
        output: "2",
        explanation: "There are two ways to climb to the top: 1. 1 step + 1 step, 2. 2 steps"
      }
    ],
    constraints: [
      "1 <= n <= 45"
    ],
    test_cases: [
      { input: "2", expected: "2" },
      { input: "3", expected: "3" },
      { input: "4", expected: "5" }
    ],
    created_at: "2024-01-08T00:00:00Z"
  }
];

const mockLeaderboard = [
  { rank: 1, name: "Alice Johnson", score: 1250, problems_solved: 45 },
  { rank: 2, name: "Bob Smith", score: 1180, problems_solved: 42 },
  { rank: 3, name: "Charlie Brown", score: 1100, problems_solved: 38 },
  { rank: 4, name: "Diana Prince", score: 1050, problems_solved: 35 },
  { rank: 5, name: "Eve Wilson", score: 980, problems_solved: 32 }
];

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Mock server is running' });
});

app.get('/api/problems', (req, res) => {
  const { 
    difficulty, 
    topic,
    subtopic,
    tags,
    sort = 'created_at', 
    order = 'desc', 
    search,
    page = 1, 
    limit = 10 
  } = req.query;

  let filteredProblems = [...mockProblems];

  // Filter by difficulty
  if (difficulty && difficulty !== 'all') {
    filteredProblems = filteredProblems.filter(p => p.difficulty === difficulty);
  }

  // Filter by topic
  if (topic && topic !== 'all') {
    filteredProblems = filteredProblems.filter(p => p.topic === topic);
  }

  // Filter by subtopic
  if (subtopic && subtopic !== 'all') {
    filteredProblems = filteredProblems.filter(p => p.subtopic === subtopic);
  }

  // Filter by tags (comma-separated)
  if (tags) {
    const tagList = tags.split(',').map(tag => tag.trim().toLowerCase());
    filteredProblems = filteredProblems.filter(p => 
      tagList.some(tag => p.tags.includes(tag))
    );
  }

  // Search by title, description, or tags
  if (search) {
    const searchLower = search.toLowerCase();
    filteredProblems = filteredProblems.filter(p => 
      p.title.toLowerCase().includes(searchLower) ||
      p.description.toLowerCase().includes(searchLower) ||
      p.tags.some(tag => tag.includes(searchLower)) ||
      p.topic.toLowerCase().includes(searchLower) ||
      p.subtopic.toLowerCase().includes(searchLower)
    );
  }

  // Enhanced sorting with topic priority
  filteredProblems.sort((a, b) => {
    let aValue, bValue;
    
    switch (sort) {
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'difficulty':
        const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
        aValue = difficultyOrder[a.difficulty];
        bValue = difficultyOrder[b.difficulty];
        break;
      case 'topic':
        // Sort by topic first, then by title within topic
        if (a.topic !== b.topic) {
          aValue = a.topic;
          bValue = b.topic;
        } else {
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
        }
        break;
      case 'acceptance_rate':
        aValue = a.acceptance_rate;
        bValue = b.acceptance_rate;
        break;
      case 'submissions':
        aValue = a.submissions;
        bValue = b.submissions;
        break;
      case 'created_at':
      default:
        aValue = new Date(a.created_at);
        bValue = new Date(b.created_at);
        break;
    }

    if (order === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = startIndex + limitNum;
  const paginatedProblems = filteredProblems.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredProblems.length / limitNum);

  // Get available topics and subtopics for filtering
  const availableTopics = [...new Set(mockProblems.map(p => p.topic))].sort();
  const availableSubtopics = [...new Set(mockProblems.map(p => p.subtopic))].sort();
  const availableTags = [...new Set(mockProblems.flatMap(p => p.tags))].sort();

  res.json({ 
    problems: paginatedProblems,
    pagination: {
      page: pageNum,
      pages: totalPages,
      total: filteredProblems.length,
      limit: limitNum
    },
    filters: {
      difficulty: difficulty || 'all',
      topic: topic || 'all',
      subtopic: subtopic || 'all',
      tags: tags || '',
      sort,
      order,
      search: search || ''
    },
    availableFilters: {
      topics: availableTopics,
      subtopics: availableSubtopics,
      tags: availableTags
    }
  });
});

app.get('/api/problems/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const problem = mockProblems.find(p => p.id === id);
  
  if (!problem) {
    return res.status(404).json({ error: 'Problem not found' });
  }
  
  res.json({ problem });
});

app.get('/api/leaderboard', (req, res) => {
  res.json({ leaderboard: mockLeaderboard });
});

app.get('/api/stats', (req, res) => {
  res.json({
    total_problems: mockProblems.length,
    total_users: 150,
    total_submissions: 2500,
    average_score: 850
  });
});

// New endpoint for topic-wise statistics and organization
app.get('/api/topics', (req, res) => {
  const topicStats = {};
  
  mockProblems.forEach(problem => {
    const topic = problem.topic;
    if (!topicStats[topic]) {
      topicStats[topic] = {
        name: topic,
        count: 0,
        difficulties: { easy: 0, medium: 0, hard: 0 },
        subtopics: new Set(),
        totalSubmissions: 0,
        averageAcceptanceRate: 0
      };
    }
    
    topicStats[topic].count++;
    topicStats[topic].difficulties[problem.difficulty]++;
    topicStats[topic].subtopics.add(problem.subtopic);
    topicStats[topic].totalSubmissions += problem.submissions;
  });

  // Calculate average acceptance rates and convert sets to arrays
  Object.keys(topicStats).forEach(topic => {
    const topicProblems = mockProblems.filter(p => p.topic === topic);
    const avgAcceptance = topicProblems.reduce((sum, p) => sum + p.acceptance_rate, 0) / topicProblems.length;
    topicStats[topic].averageAcceptanceRate = Math.round(avgAcceptance * 10) / 10;
    topicStats[topic].subtopics = Array.from(topicStats[topic].subtopics).sort();
  });

  res.json({
    topics: Object.values(topicStats).sort((a, b) => b.count - a.count),
    totalTopics: Object.keys(topicStats).length
  });
});

// Auth routes (mock)
app.post('/api/auth/register', (req, res) => {
  res.json({
    message: 'User registered successfully',
    token: 'mock-jwt-token',
    user: {
      id: 1,
      name: req.body.name,
      email: req.body.email,
      role: 'student',
      created_at: new Date().toISOString()
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  res.json({
    message: 'Login successful',
    token: 'mock-jwt-token',
    user: {
      id: 1,
      name: 'Test User',
      email: req.body.email,
      role: 'student',
      created_at: new Date().toISOString()
    }
  });
});

app.get('/api/auth/profile', (req, res) => {
  res.json({
    user: {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      role: 'student',
      created_at: new Date().toISOString()
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mock server running on http://localhost:${PORT}`);
  console.log(`📊 Available endpoints:`);
  console.log(`   GET  /api/health`);
  console.log(`   GET  /api/problems`);
  console.log(`   GET  /api/problems/:id`);
  console.log(`   GET  /api/leaderboard`);
  console.log(`   GET  /api/stats`);
  console.log(`   POST /api/auth/register`);
  console.log(`   POST /api/auth/login`);
  console.log(`   GET  /api/auth/profile`);
});
