import Header from '@/components/protocraft/header';
import ComponentLibrary from '@/components/protocraft/component-library';
import LivePreview from '@/components/protocraft/live-preview';
import AiSuggestionTool from '@/components/protocraft/ai-suggestion-tool';
import StyleCustomizer from '@/components/protocraft/style-customizer';
import { AppWindow } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      <Header />
      <div className="flex-1 grid lg:grid-cols-[280px_1fr_340px] gap-6 p-6 overflow-hidden">
        <aside className="hidden lg:flex flex-col">
          <ComponentLibrary />
        </aside>
        <main className="overflow-hidden rounded-lg border border-border">
          <LivePreview />
        </main>
        <aside className="hidden lg:flex flex-col gap-6 overflow-y-auto pr-2">
          <AiSuggestionTool />
          <StyleCustomizer />
        </aside>
      </div>
      <div className="lg:hidden flex flex-1 flex-col items-center justify-center text-center p-4">
        <AppWindow className="w-12 h-12 text-primary mb-4" />
        <h2 className="text-2xl font-bold">ProtoCraft is best on Desktop</h2>
        <p className="text-muted-foreground mt-2 max-w-sm">
          Please switch to a larger screen to use the layout designer and other features.
        </p>
      </div>
    </div>
  );
}
