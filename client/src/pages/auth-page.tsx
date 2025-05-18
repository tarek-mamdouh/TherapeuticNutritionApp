import { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useUser } from "@/contexts/UserContext";
import Layout from "@/components/Layout";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Registration form schema
const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().optional(),
  language: z.enum(["ar", "en"]).default("ar"),
  specialNeeds: z.boolean().default(false),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { user, login, isLoading: userLoading } = useUser();

  // Redirect if user is already logged in
  if (user && !userLoading) {
    navigate("/");
    return null;
  }

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      name: "",
      language: "ar",
      specialNeeds: false,
    },
  });

  // Handle login submission
  const onLoginSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      const success = await login(values.username, values.password);
      
      if (success) {
        toast({
          title: t("loginSuccess"),
          description: t("welcomeBack"),
        });
        navigate("/");
      } else {
        toast({
          variant: "destructive",
          title: t("loginFailed"),
          description: t("invalidCredentials"),
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("loginFailed"),
        description: t("somethingWentWrong"),
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle registration submission
  const onRegisterSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/register", values);
      
      if (response.ok) {
        toast({
          title: t("registrationSuccess"),
          description: t("accountCreated"),
        });
        
        // Auto-login after registration
        await login(values.username, values.password);
        navigate("/");
      } else {
        const errorData = await response.json();
        toast({
          variant: "destructive",
          title: t("registrationFailed"),
          description: errorData.message || t("somethingWentWrong"),
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("registrationFailed"),
        description: t("somethingWentWrong"),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex min-h-[calc(100vh-150px)] flex-col md:flex-row">
        {/* Authentication forms section */}
        <div className="flex flex-1 flex-col items-center justify-center p-6 md:w-1/2">
          <div className="w-full max-w-md">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="login">{t("login")}</TabsTrigger>
                <TabsTrigger value="register">{t("register")}</TabsTrigger>
              </TabsList>
              
              {/* Login Tab */}
              <TabsContent value="login">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("login")}</CardTitle>
                    <CardDescription>{t("loginDescription")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("username")}</FormLabel>
                              <FormControl>
                                <Input placeholder={t("enterUsername")} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("password")}</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder={t("enterPassword")} 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" className="w-full" disabled={isLoading}>
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {t("loggingIn")}
                            </>
                          ) : (
                            t("login")
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Register Tab */}
              <TabsContent value="register">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("register")}</CardTitle>
                    <CardDescription>{t("registerDescription")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("username")}</FormLabel>
                              <FormControl>
                                <Input placeholder={t("chooseUsername")} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("email")}</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder={t("enterEmail")} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("password")}</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder={t("choosePassword")} 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("name")} ({t("optional")})</FormLabel>
                              <FormControl>
                                <Input placeholder={t("enterName")} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="language"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("preferredLanguage")}</FormLabel>
                              <div className="flex space-x-4 rtl:space-x-reverse">
                                <Button
                                  type="button"
                                  variant={field.value === "ar" ? "default" : "outline"}
                                  onClick={() => registerForm.setValue("language", "ar")}
                                  className="flex-1"
                                >
                                  العربية
                                </Button>
                                <Button
                                  type="button"
                                  variant={field.value === "en" ? "default" : "outline"}
                                  onClick={() => registerForm.setValue("language", "en")}
                                  className="flex-1"
                                >
                                  English
                                </Button>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="specialNeeds"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rtl:space-x-reverse p-4 border rounded-md bg-muted/30">
                              <FormControl>
                                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                  <input
                                    type="checkbox"
                                    checked={field.value}
                                    onChange={(e) => field.onChange(e.target.checked)}
                                    className="w-4 h-4"
                                  />
                                  <FormLabel className="m-0">{t("auth.specialNeeds")}</FormLabel>
                                </div>
                              </FormControl>
                              <div className="text-sm text-muted-foreground">
                                {t("auth.enableFullAudio")}
                              </div>
                            </FormItem>
                          )}
                        />
                        <Button type="submit" className="w-full" disabled={isLoading}>
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {t("registering")}
                            </>
                          ) : (
                            t("createAccount")
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        {/* Hero section */}
        <div className="flex flex-1 flex-col items-center justify-center bg-primary text-primary-foreground p-6 md:w-1/2">
          <div className="text-center max-w-lg">
            <h1 className="text-3xl font-bold mb-4">{t("app.title")}</h1>
            <p className="text-xl mb-6">{t("app.tagline")}</p>
            <div className="space-y-4">
              <div className="flex items-center rtl:space-x-reverse space-x-2">
                <div className="bg-primary-foreground text-primary w-8 h-8 rounded-full flex items-center justify-center">
                  1
                </div>
                <p>{t("auth.features.analysis")}</p>
              </div>
              <div className="flex items-center rtl:space-x-reverse space-x-2">
                <div className="bg-primary-foreground text-primary w-8 h-8 rounded-full flex items-center justify-center">
                  2
                </div>
                <p>{t("auth.features.chatbot")}</p>
              </div>
              <div className="flex items-center rtl:space-x-reverse space-x-2">
                <div className="bg-primary-foreground text-primary w-8 h-8 rounded-full flex items-center justify-center">
                  3
                </div>
                <p>{t("auth.features.accessibility")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}