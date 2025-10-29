
'use client';

import AIAdvisorChat from '@/components/financify/ai-advisor-chat';
import { Card, CardContent } from '@/components/ui/card';

export default function AIAdvisorPage() {
  return (
    <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)] flex flex-col">
       <Card className="flex-1 flex flex-col overflow-hidden">
        <CardContent className="flex-1 flex flex-col p-0">
          <AIAdvisorChat />
        </CardContent>
      </Card>
    </div>
  );
}
