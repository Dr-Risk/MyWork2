import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-headline font-bold tracking-tight">
        Settings
      </h1>
      <p className="text-muted-foreground">
        Manage your account and notification preferences.
      </p>
       <Card className="mt-6">
        <CardHeader>
            <div className="flex items-center gap-4">
                <Settings className="w-8 h-8 text-primary"/>
                <div>
                    <CardTitle>Content Under Development</CardTitle>
                    <CardDescription>This section is coming soon. Stay tuned for updates on account settings!</CardDescription>
                </div>
            </div>
        </CardHeader>
      </Card>
    </div>
  );
}
