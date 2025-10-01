'use client';

import { useState, useRef, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, RotateCcw, Copy, Download, Upload } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { Submission } from '@/types';

interface CodeEditorProps {
  problemId: string;
  initialCode?: string;
  language: 'python' | 'java' | 'cpp' | 'c';
  onLanguageChange: (language: 'python' | 'java' | 'cpp' | 'c') => void;
  onSubmissionResult: (result: Submission) => void;
}

const languageTemplates = {
  python: `def solution():
    # Write your code here
    pass`,
  java: `public class Solution {
    public static void main(String[] args) {
        // Write your code here
    }
}`,
  cpp: `#include <iostream>
using namespace std;

int main() {
    // Write your code here
    return 0;
}`,
  c: `#include <stdio.h>

int main() {
    // Write your code here
    return 0;
}`
};

const languageOptions = [
  { value: 'python', label: 'Python', extension: 'py' },
  { value: 'java', label: 'Java', extension: 'java' },
  { value: 'cpp', label: 'C++', extension: 'cpp' },
  { value: 'c', label: 'C', extension: 'c' },
];

export const CodeEditor: React.FC<CodeEditorProps> = ({
  problemId,
  initialCode,
  language,
  onLanguageChange,
  onSubmissionResult,
}) => {
  const [code, setCode] = useState(initialCode || languageTemplates[language]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<Submission | null>(null);
  const editorRef = useRef<any>(null);
  const { post } = useApi();

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
    } else {
      setCode(languageTemplates[language]);
    }
  }, [language, initialCode]);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    
    // Configure editor options
    editor.updateOptions({
      minimap: { enabled: false },
      fontSize: 14,
      lineNumbers: 'on',
      roundedSelection: false,
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 4,
      insertSpaces: true,
    });
  };

  const handleLanguageChange = (newLanguage: 'python' | 'java' | 'cpp' | 'c') => {
    onLanguageChange(newLanguage);
    setCode(languageTemplates[newLanguage]);
  };

  const handleSubmit = async () => {
    if (!code.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await post<Submission>('/api/submissions/submit', {
        problem_id: problemId,
        code: code.trim(),
        language,
      });

      setSubmissionResult(result);
      onSubmissionResult(result);
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setCode(languageTemplates[language]);
    setSubmissionResult(null);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solution.${languageOptions.find(l => l.value === language)?.extension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'wrong_answer':
        return 'bg-red-100 text-red-800';
      case 'time_limit_exceeded':
        return 'bg-orange-100 text-orange-800';
      case 'runtime_error':
        return 'bg-red-100 text-red-800';
      case 'compilation_error':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Language Selector and Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value as any)}
            className="px-3 py-2 border border-input rounded-md bg-background"
          >
            {languageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          {submissionResult && (
            <Badge className={getStatusColor(submissionResult.status)}>
              {submissionResult.status.replace('_', ' ').toUpperCase()}
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={isSubmitting}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            disabled={isSubmitting}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={isSubmitting}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* Code Editor */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Code Editor</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-96">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={(value) => setCode(value || '')}
              onMount={handleEditorDidMount}
              theme="vs-dark"
              options={{
                selectOnLineNumbers: true,
                roundedSelection: false,
                readOnly: false,
                cursorStyle: 'line',
                automaticLayout: true,
                wordWrap: 'on',
                scrollBeyondLastLine: false,
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !code.trim()}
          className="min-w-32"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Submitting...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Submit Code
            </>
          )}
        </Button>
      </div>

      {/* Submission Result */}
      {submissionResult && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Submission Result</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Status:</span>
                <Badge className={getStatusColor(submissionResult.status)}>
                  {submissionResult.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              
              {submissionResult.runtime && (
                <div className="flex items-center justify-between">
                  <span className="font-medium">Runtime:</span>
                  <span>{submissionResult.runtime}ms</span>
                </div>
              )}
              
              {submissionResult.memory && (
                <div className="flex items-center justify-between">
                  <span className="font-medium">Memory:</span>
                  <span>{submissionResult.memory}KB</span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="font-medium">Submitted:</span>
                <span>{new Date(submissionResult.created_at).toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
