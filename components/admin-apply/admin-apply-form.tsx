'use client';

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuth } from "@/context/user_context";

// form validation schema
const formSchema = z.object({
    username: z.string().min(2, {
        message: "Username must be at least 2 characters",
    }),
    email: z.string().email({
        message: "Invalid email address",
    }),
    password: z.string().min(8, {
        message: "Password must be at least 8 characters",
    }),
    confirmPassword: z.string().min(1, {
        message: "Confirm password is required",
    }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match!",
    path: ["confirmPassword"]
});

export function AdminApplyForm({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"div">) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();

    // define form
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
        }
    });

    // form submission handler
    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/admin-application/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: data.username,
                    email: data.email,
                    password: data.password
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Application submission failed');
            }

            // Log the user in after successful registration
            await login(data.email, data.password);

            toast.success(
                <div className="flex flex-col">
                    <strong>Account created!</strong>
                    <span className="text-xs text-gray-500">You may now upload required documents to queue your applicaiton for review.</span>
                </div>,
                {
                    duration: 5000
                }
            );
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to submit application. Please try again.";
            toast.error(message);
            // toast.error(error.message || "Failed to submit application. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={cn("w-full max-w-md mx-auto p-4 sm:p-6", className)} {...props}>
            <Card className="w-full">
                <CardHeader>
                    <span className='text-2xl sm:text-3xl font-medium'>Apply for Admin Access</span>
                    <CardDescription className="text-sm sm:text-base">
                        Create an account to apply as a coach administrator
                    </CardDescription>
                </CardHeader>
                <CardContent className='flex flex-col gap-4 items-center px-4 sm:px-6'>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm sm:text-base">Username</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="johndoe"
                                                type="text"
                                                className="h-10 sm:h-11 text-sm sm:text-base"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs sm:text-sm" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm sm:text-base">Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="coach@example.com"
                                                type="email"
                                                className="h-10 sm:h-11 text-sm sm:text-base"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs sm:text-sm" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm sm:text-base">Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="••••••••"
                                                type="password"
                                                className="h-10 sm:h-11 text-sm sm:text-base"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs sm:text-sm" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm sm:text-base">Confirm Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="••••••••"
                                                type="password"
                                                className="h-10 sm:h-11 text-sm sm:text-base"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs sm:text-sm" />
                                    </FormItem>
                                )}
                            />

                            <div className='flex flex-col gap-2 sm:gap-3 w-full pt-2'>
                                <Button 
                                    className='w-full h-10 sm:h-11 text-sm sm:text-base' 
                                    type="submit"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Submitting..." : "Submit Application"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className='flex flex-col gap-2 items-center px-4 sm:px-6'>
                    <p className='text-xs sm:text-sm text-gray-500 text-center'>
                        Your application will be reviewed by our team. You&apos;ll receive an email response within 3-5 business days.
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}