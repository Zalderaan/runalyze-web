// import Image from "next/image";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Landing() {
  return (
    <div className="flex flex-col gap-4 justify-center items-center min-h-screen p-8 pb-20">
      <h1 className="text-2xl font-bold">Welcome to the Home Page</h1>
      <p>This is the main content of the home page.</p>
      <Link href={'/login'}><Button>Testing</Button></Link>
    </div>
  );
}
