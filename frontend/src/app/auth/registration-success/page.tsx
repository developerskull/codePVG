'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Home } from 'lucide-react';
import Link from 'next/link';

export default function RegistrationSuccessPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Registration Successful!</CardTitle>
          <CardDescription>
            Your account has been created successfully
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <p className="text-sm text-green-900">
              <strong>Account Created Successfully!</strong>
              <br />
              Your account has been registered and is now pending admin approval. 
              You&apos;ll receive a notification once your account is approved.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>What&apos;s next?</strong>
              <br />
              An admin will review your registration details within 24-48 hours. 
              Once approved, you can log in and start solving problems!
            </p>
          </div>

          <div>
            <Button 
              asChild 
              className="w-full bg-black hover:bg-gray-800 text-white"
            >
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Go to Home
              </Link>
            </Button>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-center text-muted-foreground">
              Need help? Contact support at{' '}
              <a href="mailto:support@collegecode.com" className="text-primary hover:underline">
                support@collegecode.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

