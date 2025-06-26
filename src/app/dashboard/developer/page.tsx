import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Code } from "lucide-react";

export default function DeveloperPage() {
  return (
    <div>
      <h1 className="text-3xl font-headline font-bold tracking-tight">
        Developer
      </h1>
      <p className="text-muted-foreground">
        Access API documentation and developer tools.
      </p>
       <Card className="mt-6">
        <CardHeader>
            <div className="flex items-center gap-4">
                <Code className="w-8 h-8 text-primary"/>
                <div>
                    <CardTitle>Content Under Development</CardTitle>
                    <CardDescription>This section is coming soon. Stay tuned for updates on developer resources!</CardDescription>
                </div>
            </div>
        </CardHeader>
      </Card>
    </div>
  );
}
