import { Button } from "@/components/ui/button";
import { Download, Layers } from "lucide-react";

export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-border/50 z-10 shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Layers className="w-5 h-5 text-primary-foreground" />
        </div>
        <h1 className="text-xl font-bold text-foreground">ProtoCraft</h1>
      </div>
      <Button>
        <Download className="mr-2" />
        Export to Code
      </Button>
    </header>
  );
}
