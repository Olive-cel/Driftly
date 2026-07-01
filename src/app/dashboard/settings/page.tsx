"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2, LogOut } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setEmail(user.email || "");
    } catch (err) {
      console.error("Error:", err);
      setError("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Paramètres</h1>
            <p className="text-neutral-600 mt-2">
              Gérez votre compte et vos préférences
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Account Section */}
          <div className="space-y-6 pb-6 border-b border-neutral-200">
            <h2 className="text-xl font-semibold text-neutral-900">Compte</h2>

            <div>
              <Label htmlFor="email" className="text-neutral-700 font-medium">
                Adresse email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="mt-2 bg-neutral-100 text-neutral-600"
              />
              <p className="text-xs text-neutral-500 mt-2">
                Non modifiable. Contactez le support pour changer d&apos;email.
              </p>
            </div>
          </div>

          {/* Logout Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-neutral-900">Session</h2>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full border-red-200 text-red-600 hover:bg-red-50 font-semibold py-2 rounded-lg transition-all"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Se déconnecter
            </Button>
          </div>

          {/* Support */}
          <div className="bg-neutral-50 rounded-lg p-4 text-sm text-neutral-600 text-center">
            Besoin d&apos;aide ? Consultez la{" "}
            <a href="#" className="font-medium text-amber-600 hover:underline">
              documentation
            </a>
            ou contactez le support.
          </div>
        </div>
      </div>
    </div>
  );
}
