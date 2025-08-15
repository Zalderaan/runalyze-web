'use client';
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { signUp } from '@/lib/auth/actions';
// import { useUserContext } from "@/context/userContext";

// form validation schema
const formSchema = z.object({
    username: z.string(),
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
    path: ["confirmPassword"] // show error on confirmPassword field
});

export function RegisterForm({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"div">) {

    // const { signIn, signUp, signOut } = useUserContext();

    // define form
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
        }
    })

    // form submission handler
    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        console.log(data);
        const { username, email, password } = data;
        try {
            await signUp(data)
        } catch (error) {
            form.setError('email', { type: 'manual', message: 'Registration failed' });
        }
    }

    return (
        <div className={cn("w-full max-w-md mx-auto p-4 sm:p-6", className)} {...props}>
            <Card className="w-full">
                <CardHeader>
                    <span className='text-2xl sm:text-3xl font-medium'>Register</span>
                    <CardDescription className="text-sm sm:text-base">
                        Create your account
                    </CardDescription>
                </CardHeader>
                <CardContent className='flex flex-col gap-4 items-center px-4 sm:px-6'>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
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
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm sm:text-base">Username</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder="Enter username" 
                                                type="text" 
                                                className="h-10 sm:h-11 text-sm sm:text-base"
                                                {...field} 
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs sm:text-sm" />
                                    </FormItem>
                                )}
                            />
                            <div className="flex flex-col space-y-2 sm:space-y-3">
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
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

                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            {/* <FormLabel>Confirm Password</FormLabel> */}
                                            <FormControl>
                                                <Input 
                                                    placeholder="Confirm password" 
                                                    type="password" 
                                                    className="h-10 sm:h-11 text-sm sm:text-base"
                                                    {...field} 
                                                />
                                            </FormControl>
                                            <FormMessage className="text-xs sm:text-sm" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className='flex flex-col gap-2 sm:gap-3 w-full pt-2'>
                                <Button className='w-full h-10 sm:h-11 text-sm sm:text-base' type="submit">Sign up</Button>
                                {/* <Button variant={'outline'} className='w-full h-10 sm:h-11 text-sm sm:text-base'>Sign up with Google</Button> */}
                            </div>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className='flex flex-col gap-4 items-center px-4 sm:px-6'>
                    <p className='text-sm sm:text-base'>Already have an account?{' '}
                        <span className='text-blue-500 underline cursor-pointer hover:text-blue-950'>
                            <Link href='/auth/login'>
                                Sign In
                            </Link>
                        </span>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}