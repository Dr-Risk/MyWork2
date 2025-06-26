import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function UsersPage() {
  return (
    <div>
      <h1 className="text-3xl font-headline font-bold tracking-tight">
        Other Users
      </h1>
      <p className="text-muted-foreground">
        Connect with colleagues and other healthcare professionals.
      </p>
       <Card className="mt-6">
        <CardHeader>
            <div className="flex items-center gap-4">
                <Users className="w-8 h-8 text-primary"/>
                <div>
                    <CardTitle>Content Under Development</CardTitle>
                    <CardDescription>This section is coming soon. Stay tuned for updates on user profiles!</CardDescription>
                </div>
            </div>
        </CardHeader>
      </Card>
    </div>
  );
}
