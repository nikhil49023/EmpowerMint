import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";

interface SuggestionCardProps {
  title: string;
  icon: ReactNode;
  content: string | string[];
}

export default function SuggestionCard({ title, icon, content }: SuggestionCardProps) {
  return (
    <Card className="bg-card/50">
      <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
        <div className="w-5 h-5 text-accent">{icon}</div>
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {typeof content === 'string' ? (
          <p className="text-sm text-muted-foreground">{content}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {content.map((item, index) => (
              <Badge key={index} variant="secondary" className="font-normal">{item}</Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
