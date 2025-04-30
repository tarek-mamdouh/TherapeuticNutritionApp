import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useUser } from "@/contexts/UserContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { t } from "@/lib/i18n";
import { Loader2, Save, UserCircle } from "lucide-react";

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  age: z.string().refine(
    (val) => {
      const num = parseInt(val);
      return !isNaN(num) && num > 0 && num < 120;
    },
    {
      message: "Age must be a number between 1 and 120.",
    }
  ),
  diabetesType: z.enum(["type1", "type2", "gestational", "none"]),
  notificationsEnabled: z.boolean().default(true),
  highContrastMode: z.boolean().default(false),
  largeFontSize: z.boolean().default(false),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const ProfilePage: React.FC = () => {
  const { user, updateUser, isLoading } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const defaultValues: Partial<ProfileFormValues> = {
    name: user?.name || "",
    age: user?.age ? String(user.age) : "",
    diabetesType: (user?.diabetesType as "type1" | "type2" | "gestational" | "none") || "none",
    notificationsEnabled: true,
    highContrastMode: false,
    largeFontSize: false,
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
  });

  async function onSubmit(data: ProfileFormValues) {
    setIsSubmitting(true);
    try {
      await updateUser({
        name: data.name,
        age: parseInt(data.age),
        diabetesType: data.diabetesType,
        preferences: JSON.stringify({
          notifications: data.notificationsEnabled,
          highContrast: data.highContrastMode,
          largeFont: data.largeFontSize,
        }),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">{t("profile.title")}</h2>
        <p className="text-neutral-dark text-lg">{t("profile.description")}</p>
      </div>
      
      <Card className="p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/3">
            <div className="flex flex-col items-center">
              <Avatar className="h-32 w-32 mb-4">
                <AvatarImage src={user?.avatarUrl} />
                <AvatarFallback className="text-4xl">
                  {user?.name?.[0] || <UserCircle className="h-20 w-20" />}
                </AvatarFallback>
              </Avatar>
              
              <h3 className="text-xl font-bold mb-1">{user?.name || t("profile.guest")}</h3>
              <p className="text-neutral-dark">{user?.username}</p>
              
              <Button variant="outline" className="mt-4">
                {t("profile.changePhoto")}
              </Button>
            </div>
          </div>
          
          <div className="md:w-2/3">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("profile.fields.name")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("profile.placeholders.name")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("profile.fields.age")}</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder={t("profile.placeholders.age")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="diabetesType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>{t("profile.fields.diabetesType")}</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0 rtl:space-x-reverse">
                            <FormControl>
                              <RadioGroupItem value="type1" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              {t("profile.diabetesTypes.type1")}
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0 rtl:space-x-reverse">
                            <FormControl>
                              <RadioGroupItem value="type2" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              {t("profile.diabetesTypes.type2")}
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0 rtl:space-x-reverse">
                            <FormControl>
                              <RadioGroupItem value="gestational" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              {t("profile.diabetesTypes.gestational")}
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0 rtl:space-x-reverse">
                            <FormControl>
                              <RadioGroupItem value="none" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              {t("profile.diabetesTypes.none")}
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">{t("profile.preferences")}</h3>
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="notificationsEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                          <div className="space-y-0.5">
                            <FormLabel>{t("profile.fields.notifications")}</FormLabel>
                            <FormDescription>
                              {t("profile.descriptions.notifications")}
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="highContrastMode"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                          <div className="space-y-0.5">
                            <FormLabel>{t("profile.fields.highContrast")}</FormLabel>
                            <FormDescription>
                              {t("profile.descriptions.highContrast")}
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="largeFontSize"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                          <div className="space-y-0.5">
                            <FormLabel>{t("profile.fields.largeFont")}</FormLabel>
                            <FormDescription>
                              {t("profile.descriptions.largeFont")}
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin rtl:ml-2 ltr:mr-2" />
                      {t("profile.saving")}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 rtl:ml-2 ltr:mr-2" />
                      {t("profile.saveChanges")}
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </Card>
    </>
  );
};

export default ProfilePage;
