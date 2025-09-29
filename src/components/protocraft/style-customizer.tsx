import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Palette } from "lucide-react";

export default function StyleCustomizer() {
  return (
    <Card className="bg-card/70 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Palette className="w-6 h-6 text-primary"/>
            Style Customization
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="primary-color">Primary Color</Label>
          <div className="flex items-center gap-2">
            <Input type="color" id="primary-color" defaultValue="#3498db" className="w-12 h-10 p-1 cursor-pointer" />
            <Input defaultValue="#3498db" readOnly className="flex-1" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="bg-color">Background Color</Label>
          <div className="flex items-center gap-2">
            <Input type="color" id="bg-color" defaultValue="#0d1117" className="w-12 h-10 p-1 cursor-pointer" />
            <Input defaultValue="#0d1117" readOnly className="flex-1" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="font-family">Font Family</Label>
          <Select defaultValue="inter">
            <SelectTrigger id="font-family">
              <SelectValue placeholder="Select a font" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inter">Inter</SelectItem>
              <SelectItem value="roboto">Roboto</SelectItem>
              <SelectItem value="lato">Lato</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="spacing">Spacing</Label>
           <Select defaultValue="default">
            <SelectTrigger id="spacing">
              <SelectValue placeholder="Select spacing" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="compact">Compact</SelectItem>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="spacious">Spacious</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
