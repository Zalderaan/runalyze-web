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

// form validation schema
const formSchema = z.object({
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

    // define form
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
        }
    })

    // form submission handler
    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        console.log(data);
        // const { email, password } = data;
        // const { data: authData, error } = await supabase.auth.signUp({
        //     email, 
        //     password
        // });

        // if (error) {
        //     console.error('Supabase sign-up error: ', error);
        //     form.setError('email', { type: 'manual', message: error.message });
        // } else {
        //     console.log('Registraion successful', authData);
        // }
    }

    return (
        <div className={cn(className)} {...props}>
            <Card>
                <CardHeader>
                    <span className='text-2xl font-medium'>Register</span>
                    <CardDescription>
                        Create to your account
                    </CardDescription>
                </CardHeader>
                <CardContent className='flex flex-col gap-4 items-center'>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="user@example.com" type="email" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex flex-col space-y-2">
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter your password" type="password" {...field} />
                                            </FormControl>
                                            <FormMessage />
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
                                                <Input placeholder="Confirm password" type="password" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className='flex flex-col gap-2 w-full'>
                                <Button className='w-full' type="submit">Sign up</Button>
                                <Button variant={'outline'} className='w-full'>Sign up with Google</Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className='flex flex-col gap-4 items-center'>
                    <p className='text-sm'>Already have an account?{' '}
                        <span className='text-blue-500 underline cursor-pointer hover:text-blue-950'>
                            <Link href='/login'>
                                Sign In
                            </Link>
                        </span>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}