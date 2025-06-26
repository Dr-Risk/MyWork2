import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Library } from "lucide-react";

export default function ResourcesPage() {
  return (
    <div>
      <h1 className="text-3xl font-headline font-bold tracking-tight">
        Resources
      </h1>
      <p className="text-muted-foreground">
        Access clinical guidelines, research papers, and more.
      </p>
       <Card className="mt-6">
        <CardHeader>
            <div className="flex items-center gap-4">
                <Library className="w-8 h-8 text-primary"/>
                <div>
                    <CardTitle>Content Under Development</CardTitle>
                    <CardDescription>This section is coming soon. Stay tuned for updates on available resources!</CardDescription>
                </div>
            </div>
        </CardHeader>
      </Card>
    </div>
  );
}
