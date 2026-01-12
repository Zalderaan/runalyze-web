import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Activity, BarChart3, Target, ArrowRight } from "lucide-react";
import { LandingHeader } from "@/components/landing/landing-header";
import Image from 'next/image'

export default function LandingPage() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      {/* <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Runalyze</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button asChild variant="outline">
              {user ? <Link href="/dashboard/home">Proceed to dashboard</Link> : <Link href="/auth/login">Sign In</Link> }
              
            </Button>
            <Button asChild>
              <Link href="/auth/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header> */}
      <LandingHeader />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Transform Your Running with
            <span className="text-blue-600 block">Intelligent Analysis</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Unlock your potential with AI-powered running analysis, personalized training plans,
            and comprehensive performance tracking. Take your running to the next level.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="text-lg px-8 py-3">
              <Link href="/auth/register">Start Analyzing
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" className="text-lg px-8 py-3" variant={"outline"}>
              <Link href="/auth/admin-application">Apply as a Coach</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Excel
          </h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our comprehensive platform provides all the tools and insights you need
            to optimize your running performance and achieve your goals.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Advanced Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Get detailed insights into your running form, pace distribution,
                and performance trends with our AI-powered analysis engine.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-xl">Training Drills</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Access a comprehensive library of training drills and exercises
                designed to improve your running technique and performance.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-xl">Performance Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Monitor your progress over time with detailed performance metrics,
                goal tracking, and personalized recommendations.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Why Choose Runalyze?
              </h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">AI-Powered Insights</h4>
                    <p className="text-gray-600">
                      Our advanced AI analyzes your running patterns and provides
                      actionable insights to help you improve faster.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Personalized Training</h4>
                    <p className="text-gray-600">
                      Get customized training plans and drill recommendations
                      based on your unique running style and goals.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Comprehensive History</h4>
                    <p className="text-gray-600">
                      Track your progress over time with detailed analytics
                      and performance comparisons.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl p-8 text-white">
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-24 w-24 mx-auto mb-4 opacity-80" />
                    <h4 className="text-2xl font-bold mb-2">Real-time Analysis</h4>
                    <p className="opacity-90">
                      Get instant feedback on your running performance
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Elevate Your Running?
          </h3>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of runners who have already transformed their performance
            with Runalyze. Start your journey today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="text-lg px-8 py-3" size={'lg'}>
              <Link href={'/auth/register'}>Create Free Account</Link>
            </Button>
            <Button asChild className="text-lg px-8 py-3" size={'lg'} variant={'outline'}>
              <Link href={'/auth/login'}>Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                {/* <Activity className="h-6 w-6" /> */}
                <Image src="/runalyze-new-logo-bnw.png" alt="runalyze logo black & white" height={25} width={25}/>
                <span className="text-xl font-bold">Runalyze</span>
              </div>
              <p className="text-gray-400">
                Intelligent running analysis for better performance.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Performance Analysis</li>
                <li>Training Drills</li>
                <li>Progress Tracking</li>
                <li>AI Insights</li>
              </ul>
            </div>

            {/* <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Documentation</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div> */}
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Runalyze. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
