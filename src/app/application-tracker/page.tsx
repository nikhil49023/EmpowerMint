
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlusCircle, FileText } from 'lucide-react';

export default function ApplicationTrackerPage() {
  const [applications, setApplications] = useState([]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText />
            Application Tracker
          </h1>
          <p className="text-muted-foreground">
            Manually track your government scheme and loan applications.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2" /> Add Application
        </Button>
      </div>

      <Card className="glassmorphic">
        <CardHeader>
          <CardTitle>Tracked Applications</CardTitle>
          <CardDescription>
            A list of all the applications you are tracking.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">
                You haven't added any applications to track yet.
              </p>
              <Button variant="link" className="mt-2">
                Click "Add Application" to get started.
              </Button>
            </div>
          ) : (
            <div>
              {/* List of applications will go here */}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
