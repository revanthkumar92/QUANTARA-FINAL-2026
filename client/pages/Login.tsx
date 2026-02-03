import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Atom, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { db, logAction } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    phone: "",
    email: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isDataSaved, setIsDataSaved] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("quantaraUser");
    if (user && !isLoading) {
      console.log("User already logged in, redirecting...");
      navigate("/dashboard");
    }
  }, [navigate, isLoading]);

  const validateName = (name: string): boolean => {
    if (name.trim().length < 2) {
      setErrors((prev) => ({ ...prev, name: t("login.error.name") }));
      return false;
    }
    setErrors((prev) => ({ ...prev, name: "" }));
    return true;
  };

  const validatePhone = (phone: string): boolean => {
    // Check if phone contains only digits and is exactly 10 digits
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      setErrors((prev) => ({
        ...prev,
        phone: t("login.error.phone"),
      }));
      return false;
    }
    setErrors((prev) => ({ ...prev, phone: "" }));
    return true;
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrors((prev) => ({ ...prev, email: t("login.error.email") }));
      return false;
    }
    setErrors((prev) => ({ ...prev, email: "" }));
    return true;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numeric input
    const value = e.target.value.replace(/\D/g, "");
    // Limit to 10 digits
    if (value.length <= 10) {
      setFormData((prev) => ({ ...prev, phone: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const isNameValid = validateName(formData.name);
    const isPhoneValid = validatePhone(formData.phone);
    const isEmailValid = validateEmail(formData.email);

    if (isNameValid && isPhoneValid && isEmailValid) {
      logAction("clicked_signup_button");
      setIsLoading(true);
      try {
        // Store user data in localStorage (Instant Auth)
        localStorage.setItem("quantaraUser", JSON.stringify(formData));

        // Immediate success feedback
        toast({
          title: t("login.success.title"),
          description: t("login.success.desc", { name: formData.name }),
        });

        // Navigate immediately to improve perceived speed
        navigate("/dashboard");

        // Save user data to Firestore in background
        addDoc(collection(db, "users"), {
          ...formData,
          createdAt: serverTimestamp(),
        }).catch(err => {
          console.error("Delayed Firestore save error:", err);
          // Silent failure for background sync to not block user
        });

      } catch (error) {
        console.error("Error during login process: ", error);
        toast({
          title: "Connection Error",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    } else {
      toast({
        title: "Validation Error",
        description: t("login.validation.error"),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 flex items-center justify-center p-6">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="absolute top-4 right-4 z-20">
        <LanguageSelector />
      </div>

      <Card className="w-full max-w-md relative z-10 bg-black/40 backdrop-blur-xl border-white/10">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <Atom className="h-16 w-16 text-cyan-400" />
              <div className="absolute inset-0 animate-pulse">
                <Atom className="h-16 w-16 text-cyan-300 opacity-50" />
              </div>
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-bold text-white">
              {t("login.welcome")}
            </CardTitle>
            <CardDescription className="text-gray-300 mt-2">
              {t("login.subtitle")}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">
                {t("login.name")}
              </Label>
              <Input
                id="name"
                type="text"
                placeholder={t("login.namePlaceholder")}
                value={formData.name}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, name: e.target.value }));
                  validateName(e.target.value);
                }}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-400 focus:ring-cyan-400"
                required
              />
              {errors.name && (
                <p className="text-sm text-red-400">{errors.name}</p>
              )}
            </div>

            {/* Phone Number Field */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-white">
                {t("login.phone")}
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder={t("login.phonePlaceholder")}
                value={formData.phone}
                onChange={handlePhoneChange}
                onBlur={() => validatePhone(formData.phone)}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-400 focus:ring-cyan-400"
                required
                maxLength={10}
              />
              {errors.phone && (
                <p className="text-sm text-red-400">{errors.phone}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                {t("login.email")}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t("login.emailPlaceholder")}
                value={formData.email}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, email: e.target.value }));
                  validateEmail(e.target.value);
                }}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-400 focus:ring-cyan-400"
                required
              />
              {errors.email && (
                <p className="text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-6 text-lg shadow-lg shadow-cyan-500/50 transition-all duration-300"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {t("login.submit")}...
                </>
              ) : (
                t("login.submit")
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
