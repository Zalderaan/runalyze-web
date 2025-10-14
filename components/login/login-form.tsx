'use client';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, ControllerRenderProps } from "react-hook-form";
import {
    Form, FormControl, FormField,
    FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/user_context";

// form validation schema
const formSchema = z.object({
    email: z.string().email({
        message: "Invalid email address",
    }),
    password: z.string().min(1, {
        message: "Password is required",
    }),
});

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
    // states
    const [error, setError] = useState("");
    const { login, isLoading } = useAuth();

    // define form 
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    // form submission handler
    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        // console.log(data);
        setError(""); // Clear previous errors
        try {
            await login(data.email, data.password);
            toast.success(
                <div className="flex flex-col">
                    <strong>Login successful!</strong>
                    <span className="text-xs text-gray-500">Welcome back!</span>
                </div>,
                {
                    duration: 4000
                }
            )
        } catch (error: unknown) {
            if (error instanceof Error) {
                setError(error.message || "Invalid email or password. Please try again.");
            } else {
                setError("Invalid email or password. Please try again.");
            }
        }
    }

    return (
        <div className={cn("w-full max-w-md mx-auto p-4 sm:p-6", className)} {...props}>
            <Card className="w-full">
                <CardHeader>
                    <h1 className='text-2xl sm:text-3xl font-medium'>Login</h1>
                    <CardDescription className="text-sm sm:text-base">
                        Sign-in to your account
                    </CardDescription>
                </CardHeader>
                <CardContent className='flex flex-col gap-4 items-center px-4 sm:px-6'>
                    {error && (
                        <div className="mb-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md w-full">
                            {error}
                        </div>
                    )}
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }: { field: ControllerRenderProps<z.infer<typeof formSchema>, "email"> }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm sm:text-base">Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="user@example.com"
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
                                render={({ field }: { field: ControllerRenderProps<z.infer<typeof formSchema>, "password"> }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm sm:text-base">Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter your password"
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
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Signing in...
                                        </div>
                                    ) : (
                                        'Sign In'
                                    )}
                                </Button>
                                {/* <Button variant={'outline'} className='w-full h-10 sm:h-11 text-sm sm:text-base'>Sign in with Google</Button> */}
                            </div>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className='flex flex-col gap-4 items-center px-4 sm:px-6'>
                    <p className='text-sm sm:text-base'>Don&apos;t have an account?{' '}
                        <span className='text-blue-500 underline cursor-pointer hover:text-blue-950'>
                            <Link href='/auth/register'>
                                Sign Up
                            </Link>
                        </span>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}