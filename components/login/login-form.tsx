'use client';

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
    password: z.string().min(1, {
        message: "Password is required",
    }),
});

export function LoginForm({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"div">) {

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
        // TODO: process form data
        console.log(data);
    }

    return (
        <div className={cn(className)} {...props}>
            <Card>
                <CardHeader>
                    <h1 className='text-2xl font-medium'>Login</h1>
                    <CardDescription>
                        Sign-in to your account
                    </CardDescription>
                </CardHeader>
                <CardContent className='flex flex-col gap-4 items-center'>
                    {/* // TODO: ADD FORM  */}
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
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className='flex flex-col gap-4 items-center'>
                    <div className='flex flex-col gap-2 w-full'>
                        <Button className='w-full'>Sign-in</Button>
                        <Button variant={'outline'} className='w-full'>Sign-in with Google</Button>
                    </div>
                    <p className='text-sm'>Don't have an account?{' '}
                        <span className='text-blue-500 underline cursor-pointer hover:text-blue-950'>
                            <Link href='/register'>
                                Sign Up
                            </Link>
                        </span>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}