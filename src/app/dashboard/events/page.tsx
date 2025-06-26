import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export default function EventsPage() {
  return (
    <div>
      <h1 className="text-3xl font-headline font-bold tracking-tight">
        New Events
      </h1>
      <p className="text-muted-foreground">
        Discover upcoming events, webinars, and conferences.
      </p>
      <Card className="mt-6">
        <CardHeader>
            <div className="flex items-center gap-4">
                <Calendar className="w-8 h-8 text-primary"/>
                <div>
                    <CardTitle>Content Under Development</CardTitle>
                    <CardDescription>This section is coming soon. Stay tuned for updates on new events!</CardDescription>
                </div>
            </div>
        </CardHeader>
      </Card>
    </div>
  );
}
