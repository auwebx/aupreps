"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useState, useEffect } from "react";

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white/90 backdrop-blur rounded-xl border-2 border-green-300 shadow-lg overflow-hidden transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-green-50 transition-colors"
      >
        <span className="font-semibold text-green-900 text-lg pr-8">{question}</span>
        <svg
          className={`w-6 h-6 text-green-600 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-6 pb-5 text-gray-700 leading-relaxed border-t border-green-200 pt-4">
          {answer}
        </div>
      )}
    </div>
  );
}

function FAQSkeleton() {
  return (
    <div className="bg-white/90 backdrop-blur rounded-xl border-2 border-green-300 shadow-lg overflow-hidden">
      <div className="w-full px-6 py-5 flex justify-between items-center">
        <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
}

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [faqLoading, setFaqLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay for FAQ
    const timer = setTimeout(() => {
      setFaqLoading(false);
    }, 1500); // 1.5 seconds delay

    return () => clearTimeout(timer);
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 via-white to-green-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <main 
      className="min-h-screen"
      style={{
        backgroundImage: `
          url('https://pixabay.com/get/g3f25ad045a7332c3cd6af29e88233b5fbb15ac21bd6fc8b795380150ca878a6fdea6665255b5ff624f8239f6014b231d_1920.png?longlived='),
          url('https://pixabay.com/get/g8c1ede8c08df33187e1a3a529b848effed04303ebf81a52f5e07fb9a45dab5d1ed39f64dc7e717efb844afc5b4ade17f_1920.png?longlived='),
          url('https://pixabay.com/get/g2f6cf3c1f0ff3d9312f0aec8ee3b06c8d7af195052b86b61e6223d1730d10734326b2ba0d25a078e431e3e037d6af9dd_1920.png?longlived='),
          linear-gradient(to bottom right, #14532d, white, #14532d)
        `,
        backgroundPosition: 'top left, center, bottom right',
        backgroundSize: '20% auto, 30% auto, 10% auto, auto',
        backgroundRepeat: 'no-repeat',
        backgroundBlendMode: 'multiply, multiply, normal, normal',
        opacity: 0.9
      }}
    >
      {/* Navbar */}
      <nav className="container mx-auto p-6 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-green-800" style={{textShadow: '1px 1px 0 white, -1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white, 1px 1px 0 white, -1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white'}}>
            AUPreps
          </h1>
        </div>
        <div className="space-x-4">
          {user ? (
            <>
              <Link href="/dashboard">
                <Button className="bg-green-600 hover:bg-green-700 text-white">Dashboard</Button>
              </Link>
              <Link href="/profile">
                <Button variant="outline" className="border-green-600 text-green-700 hover:bg-green-50">Profile</Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="text-green-800 hover:bg-green-50">Login</Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg">
                  Start Free
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="container mx-auto px-6 py-24 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-8 text-green-900" style={{textShadow: '2px 2px 0 white, -2px -2px 0 white, 2px -2px 0 white, -2px 2px 0 white, 1px 1px 0 white, -1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white'}}>
          Score{" "}
          <span className="text-green-600">
            300+
          </span>{" "}
          in JAMB
          <br />
          Smash WAEC with{" "}
          <span className="text-yellow-600">A1s</span>
        </h1>
        <p className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto text-gray-700 font-medium">
          50,000+ Real Past Questions • AI Explanations • Timed Tests • Leaderboard • Offline PWA
        </p>
        <div className="space-x-6">
          <Link href="/register">
            <Button
              size="lg"
              className="text-lg px-12 py-8 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-2xl"
            >
              Start Free Trial – 7 Days Pro Access
            </Button>
          </Link>
        </div>

        <div className="mt-16 grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          <div className="text-center bg-white/80 backdrop-blur p-6 rounded-xl border-2 border-green-300 shadow-lg">
            <div className="text-5xl font-bold text-green-600">50K+</div>
            <p className="text-gray-700 font-medium">Past Questions</p>
          </div>
          <div className="text-center bg-white/80 backdrop-blur p-6 rounded-xl border-2 border-green-300 shadow-lg">
            <div className="text-5xl font-bold text-green-700">1.2M+</div>
            <p className="text-gray-700 font-medium">Practice Sessions</p>
          </div>
          <div className="text-center bg-white/80 backdrop-blur p-6 rounded-xl border-2 border-green-300 shadow-lg">
            <div className="text-5xl font-bold text-yellow-600">4.8/5</div>
            <p className="text-gray-700 font-medium">User Rating</p>
          </div>
          <div className="text-center bg-white/80 backdrop-blur p-6 rounded-xl border-2 border-green-300 shadow-lg">
            <div className="text-5xl font-bold text-green-600">300+</div>
            <p className="text-gray-700 font-medium">Average JAMB Score</p>
          </div>
        </div>
      </section>

      {/* Pricing */}
   <section className="container mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-4 text-green-900">Choose Your Plan</h2>
        <p className="text-center text-gray-600 mb-12 sm:mb-16 max-w-2xl mx-auto px-4">Start your journey with our free plan and upgrade when you are ready for unlimited AI-powered learning</p>
        
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 max-w-4xl mx-auto">
          {/* Free Plan */}
          <Card className="p-6 sm:p-8 lg:p-10 bg-white/90 backdrop-blur border-2 border-green-300 shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <div className="mb-4">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-green-800">Free Trial</h3>
              <p className="text-sm sm:text-base text-gray-600">Limited time offer</p>
            </div>
            <p className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-2 text-green-700">₦0</p>
            <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">For a limited time</p>
            <ul className="space-y-3 sm:space-y-4 mb-8 sm:mb-10 text-gray-700">
              <li className="flex items-start"><CheckCircle className="mr-2 sm:mr-3 mt-0.5 text-green-600 flex-shrink-0" size={20} /> <span className="text-sm sm:text-base">Few questions from start</span></li>
              <li className="flex items-start"><CheckCircle className="mr-2 sm:mr-3 mt-0.5 text-green-600 flex-shrink-0" size={20} /> <span className="text-sm sm:text-base">AI-powered explanations</span></li>
              <li className="flex items-start"><CheckCircle className="mr-2 sm:mr-3 mt-0.5 text-green-600 flex-shrink-0" size={20} /> <span className="text-sm sm:text-base">Basic study features</span></li>
            </ul>
            <Button className="w-full bg-green-600 text-white hover:bg-green-700 font-semibold shadow-lg text-base sm:text-lg py-5 sm:py-6">
              Start Free Trial
            </Button>
          </Card>

          {/* Premium Pay As You Go - Most Popular */}
          <Card className="p-6 sm:p-8 lg:p-10 bg-gradient-to-br from-green-600 to-green-700 text-white transform md:scale-105 border-4 border-yellow-400 relative shadow-2xl hover:shadow-3xl transition-all duration-300">
            <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-green-900 text-xs sm:text-sm px-3 sm:px-4 py-1 rounded-full font-bold shadow-lg">
              MOST POPULAR
            </div>
            <div className="mb-4 mt-2 sm:mt-0">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Premium</h3>
              <p className="text-sm sm:text-base text-green-100">Pay as you go</p>
            </div>
            <p className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-2">From ₦5,000</p>
            <p className="text-sm sm:text-base text-green-100 mb-6 sm:mb-8">Minimum top-up • Use anytime</p>
            <ul className="space-y-3 sm:space-y-4 mb-8 sm:mb-10">
              <li className="flex items-start"><CheckCircle className="mr-2 sm:mr-3 mt-0.5 flex-shrink-0" size={20} /> <span className="text-sm sm:text-base">Unlimited questions daily</span></li>
              <li className="flex items-start"><CheckCircle className="mr-2 sm:mr-3 mt-0.5 flex-shrink-0" size={20} /> <span className="text-sm sm:text-base">Advanced AI explanations</span></li>
              <li className="flex items-start"><CheckCircle className="mr-2 sm:mr-3 mt-0.5 flex-shrink-0" size={20} /> <span className="text-sm sm:text-base">Full timed practice tests</span></li>
              <li className="flex items-start"><CheckCircle className="mr-2 sm:mr-3 mt-0.5 flex-shrink-0" size={20} /> <span className="text-sm sm:text-base">AI study support 24/7</span></li>
              <li className="flex items-start"><CheckCircle className="mr-2 sm:mr-3 mt-0.5 flex-shrink-0" size={20} /> <span className="text-sm sm:text-base">Performance analytics</span></li>
              <li className="flex items-start"><CheckCircle className="mr-2 sm:mr-3 mt-0.5 flex-shrink-0" size={20} /> <span className="text-sm sm:text-base">Leaderboard access</span></li>
            </ul>
            <Link href="/subscribe">
              <Button className="w-full bg-white text-green-700 hover:bg-gray-100 font-bold shadow-lg transition-colors text-base sm:text-lg py-5 sm:py-6">
                Upgrade to Premium
              </Button>
            </Link>
          </Card>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 sm:mt-16 text-center">
          <p className="text-gray-600 mb-4">🔒 Secure payment • Cancel anytime • No hidden fees</p>
          <p className="text-sm text-gray-500">All plans include AI-powered features to boost your JAMB success</p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-6 py-24 bg-white/50 backdrop-blur">
        <h2 className="text-5xl font-bold text-center mb-4 text-green-900">Frequently Asked Questions</h2>
        <p className="text-center text-gray-600 mb-16 text-lg">Everything you need to know about AUWebX Exam</p>
        
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {/* FAQ Items */}
          <div className="md:col-span-2 space-y-4">
            {faqLoading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <FAQSkeleton key={index} />
              ))
            ) : (
              <>
                <FAQItem 
                  question="What exams does AUWebX Exam cover?"
                  answer="We cover JAMB UTME, WAEC, NECO, and other major Nigerian examinations. Our platform includes over 50,000 past questions across all subjects including Mathematics, English, Physics, Chemistry, Biology, Economics, and more."
                />
                
                <FAQItem 
                  question="How does the 7-day free trial work?"
                  answer="When you sign up, you get instant access to all Pro features for 7 days absolutely free. No credit card required! After the trial, you can choose to upgrade to a paid plan or continue with our free tier."
                />
                
                <FAQItem 
                  question="Can I use the platform offline?"
                  answer="Yes! AUWebX Exam is a Progressive Web App (PWA) that works offline. Once you've downloaded questions, you can practice anywhere without internet connection. Your progress syncs automatically when you're back online."
                />
                
                <FAQItem 
                  question="How accurate are the past questions?"
                  answer="Our questions are sourced directly from official past papers and verified by experienced educators. We maintain a 99% accuracy rate and regularly update our database to ensure you're practicing with authentic exam questions."
                />
                
                <FAQItem 
                  question="What makes the AI explanations special?"
                  answer="Our AI provides detailed, step-by-step explanations for every question. It doesn't just tell you the answer—it helps you understand the concept, shows alternative solving methods, and highlights common mistakes to avoid."
                />
                
                <FAQItem 
                  question="Can I track my progress?"
                  answer="Absolutely! Pro users get comprehensive analytics showing your performance across subjects, question types, and difficulty levels. You can see your improvement over time, identify weak areas, and compare your scores with other students on the leaderboard."
                />
                
                <FAQItem 
                  question="What payment methods do you accept?"
                  answer="We accept all major payment methods including bank cards (Visa, Mastercard), bank transfers, USSD, and mobile money. All payments are processed securely through trusted payment providers."
                />
                
                <FAQItem 
                  question="Is there a money-back guarantee?"
                  answer="Yes! If you're not satisfied within the first 14 days of your paid subscription, we offer a full refund—no questions asked. We're confident you'll love our platform, but your satisfaction is guaranteed."
                />
              </>
            )}
          </div>

          {/* Contact Card */}
          <div className="md:col-span-1">
            <div className="bg-gradient-to-br from-green-600 to-green-700 text-white rounded-xl p-8 shadow-2xl sticky top-6">
              <h3 className="text-2xl font-bold mb-6">Contact Us</h3>
              
              <div className="space-y-6">
               {/*  <div className="flex items-start">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mr-4">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm opacity-90 mb-1">Address</p>
                    <p className="font-medium">123 Education Avenue, Garki District, Abuja, Nigeria</p>
                  </div>
                </div>
 */}
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mr-4">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm opacity-90 mb-1">Email</p>
                    <a href="mailto:support@auwebxexam.com" className="font-medium hover:underline">
                      support@auwebx.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mr-4">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm opacity-90 mb-1">Phone</p>
                    <a href="tel:+2348012345678" className="font-medium hover:underline">
                      +234 801 234 5678
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mr-4">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm opacity-90 mb-1">WhatsApp</p>
                    <a href="https://wa.me/2347043619930" target="_blank" rel="noopener noreferrer" className="font-medium hover:underline">
                      +234 704 361 9930
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/20">
                <p className="text-sm opacity-90 mb-4">Business Hours</p>
                <p className="font-medium">Monday - Friday: 8AM - 6PM</p>
                <p className="font-medium">Saturday: 9AM - 4PM</p>
                <p className="font-medium text-sm opacity-75 mt-2">Closed on Sundays & Public Holidays</p>
              </div>

              <Link href="/contact">
                <Button className="w-full mt-6 bg-white text-green-700 hover:bg-gray-100 font-bold shadow-lg">
                  Send Message
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="text-center mt-16">
          <p className="text-gray-700 mb-4 text-lg">Still have questions?</p>
          <Link href="/contact">
            <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3">
              Contact Support
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-900 text-white py-16 border-t-4 border-green-600">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12">
            {/* Company Info */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <svg className="w-7 h-7 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold">AUPreps</h3>
              </div>
              <p className="text-green-200 mb-4">
                Nigerian leading online examination platform for JAMB, WAEC, and NECO preparation.
              </p>
              <p className="text-green-300 text-sm">
                Empowering students to achieve excellence through quality education.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-green-200 hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/subjects" className="text-green-200 hover:text-white transition-colors">Subjects</Link></li>
                <li><Link href="/pricing" className="text-green-200 hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/blog" className="text-green-200 hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/faq" className="text-green-200 hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-lg font-bold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><Link href="/help" className="text-green-200 hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="text-green-200 hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/privacy" className="text-green-200 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-green-200 hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/refund" className="text-green-200 hover:text-white transition-colors">Refund Policy</Link></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-bold mb-4">Contact Us</h4>
              <div className="space-y-3 text-green-200">
               {/*  <div className="flex items-start">
                  <svg className="w-5 h-5 mr-2 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>123 Education Avenue, Garki District, Abuja, Nigeria</span>
                </div> */}
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href="mailto:support@auwebxexam.com" className="hover:text-white">support@auwebx.com</a>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href="tel:+2348012345678" className="hover:text-white">+234 704 361 9930</a>
                </div>
              </div>

              {/* Social Links */}
              <div className="mt-6">
                <h5 className="font-semibold mb-3">Follow Us</h5>
                <div className="flex space-x-4">
                  <a href="https://facebook.com/auwebxexam" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-green-700 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                  <a href="https://twitter.com/auwebxexam" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-green-700 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </a>
                  <a href="https://instagram.com/auwebxexam" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-green-700 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                    </svg>
                  </a>
                  <a href="https://wa.me/2348012345678" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-green-700 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-green-700 mt-12 pt-8 text-center text-green-200">
            <p>&copy; {new Date().getFullYear()} AUPreps. All rights reserved.</p>
            <p className="mt-2 text-sm">Made with 💚 in Nigeria for Nigerian students</p>
          </div>
        </div>
      </footer>
    </main>
  );
}