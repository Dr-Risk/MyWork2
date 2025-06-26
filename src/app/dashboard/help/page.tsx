import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";

export default function HelpPage() {
  return (
    <div>
      <h1 className="text-3xl font-headline font-bold tracking-tight">Help</h1>
      <p className="text-muted-foreground">
        Find answers to your questions and get support.
      </p>
       <Card className="mt-6">
        <CardHeader>
            <div className="flex items-center gap-4">
                <HelpCircle className="w-8 h-8 text-primary"/>
                <div>
                    <CardTitle>Content Under Development</CardTitle>
                    <CardDescription>This section is coming soon. Stay tuned for updates on our help center!</CardDescription>
                </div>
            </div>
        </CardHeader>
      </Card>
    </div>
  );
}
