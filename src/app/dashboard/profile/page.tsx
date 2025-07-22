
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileForm } from "@/components/profile-form";
import { ProfilePasswordForm } from "@/components/profile-password-form";
import { MfaForm } from "@/components/mfa-form";

/**
 * @fileoverview Account Settings Page
 * 
 * @description
 * This page allows users to manage their account settings. It uses a tabbed
 * interface to separate profile info, password changes, and security settings like MFA.
 */
export default function ProfilePage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">
          Account Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your account details, password, and security settings.
        </p>
      </div>
      
      {/* Tabbed container for Profile, Password, and Security forms */}
      <Tabs defaultValue="profile" className="w-full max-w-2xl">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        {/* Profile Tab Content */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Public Profile</CardTitle>
              <CardDescription>
                Update your personal information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Password Tab Content */}
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Choose a new password for your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfilePasswordForm />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab Content for MFA */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Multi-Factor Authentication</CardTitle>
              <CardDescription>
                Add an extra layer of security to your account using a mobile authenticator app.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MfaForm />
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
