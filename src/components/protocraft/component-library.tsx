import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Baseline,
  CalendarDays,
  CheckSquare,
  CircleDot,
  PanelTop,
  RectangleHorizontal,
  SlidersHorizontal,
  TextCursorInput,
  ToggleRight,
} from "lucide-react";

const components = [
  { name: 'Button', icon: <RectangleHorizontal className="w-full h-full" /> },
  { name: 'Input', icon: <TextCursorInput className="w-full h-full" /> },
  { name: 'Card', icon: <PanelTop className="w-full h-full" /> },
  { name: 'Checkbox', icon: <CheckSquare className="w-full h-full" /> },
  { name: 'Radio Group', icon: <CircleDot className="w-full h-full" /> },
  { name: 'Switch', icon: <ToggleRight className="w-full h-full" /> },
  { name: 'Slider', icon: <SlidersHorizontal className="w-full h-full" /> },
  { name: 'Date Picker', icon: <CalendarDays className="w-full h-full" /> },
  { name: 'Text Area', icon: <Baseline className="w-full h-full" /> },
];

export default function ComponentLibrary() {
  return (
    <Card className="w-full h-full flex flex-col bg-card/70 backdrop-blur-xl">
      <CardHeader>
        <CardTitle>Component Library</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        {components.map((component) => (
          <div
            key={component.name}
            className="flex flex-col items-center justify-center gap-2 p-4 border rounded-lg bg-background/50 hover:bg-accent/20 hover:border-accent cursor-pointer transition-all duration-200 hover:scale-105"
          >
            <div className="w-8 h-8 text-primary">{component.icon}</div>
            <span className="text-xs font-medium text-center">{component.name}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
