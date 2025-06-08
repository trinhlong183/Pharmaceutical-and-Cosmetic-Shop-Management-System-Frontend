import React from "react";
import { Heart, Smartphone, Brain, Star, Users, Shield } from "lucide-react";

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
            About Us
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Smart pharmaceutical and cosmetic management system with advanced AI
            technology
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 pb-20">
        {/* Project Overview */}
        <section className="mb-16">
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 border border-purple-100">
            <div className="flex items-center mb-8">
              <Heart className="w-8 h-8 text-rose-500 mr-4" />
              <h2 className="text-3xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
                Our Project
              </h2>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Our project is developed to sell and manage pharmaceuticals with
              integrated AI development on mobile to assess skin types and
              provide suitable products for each user. We combine modern
              technology with medical expertise to deliver a personalized and
              safe shopping experience.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl border border-blue-200">
                <Users className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-800 mb-2">
                  Customer Service
                </h3>
                <p className="text-gray-600">
                  Personalized consultation for every skin type
                </p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-green-100 rounded-xl border border-emerald-200">
                <Shield className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-800 mb-2">
                  Safety & Quality
                </h3>
                <p className="text-gray-600">
                  Rigorously tested and verified products
                </p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl border border-purple-200">
                <Star className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-800 mb-2">
                  Amazing Experience
                </h3>
                <p className="text-gray-600">
                  User-friendly and intuitive interface
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* AI Features */}
        <section className="mb-16">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 rounded-2xl p-8 text-white shadow-2xl">
              <Brain className="w-12 h-12 mb-6 text-purple-100" />
              <h2 className="text-3xl font-bold mb-4">
                Advanced AI Technology
              </h2>
              <p className="text-lg leading-relaxed mb-6 text-purple-100">
                Our AI system uses machine learning algorithms to analyze your
                skin characteristics through your phone camera, providing the
                most suitable product recommendations.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-200 rounded-full mr-3"></span>
                  <span className="text-purple-100">
                    Accurate skin type analysis
                  </span>
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-200 rounded-full mr-3"></span>
                  <span className="text-purple-100">
                    Current skin condition assessment
                  </span>
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-200 rounded-full mr-3"></span>
                  <span className="text-purple-100">
                    Personalized product suggestions
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-blue-100">
              <Smartphone className="w-12 h-12 text-blue-600 mb-6" />
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                Mobile Application
              </h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                Smart mobile application allows you to scan and analyze your
                skin right at home, anytime, anywhere. Just take a photo, and AI
                will provide detailed assessment of your skin condition.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-white font-semibold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      Capture Skin Photo
                    </h4>
                    <p className="text-gray-600">
                      Use camera to capture skin area for analysis
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-white font-semibold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">AI Analysis</h4>
                    <p className="text-gray-600">
                      AI system processes and evaluates skin condition
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-white font-semibold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Get Results</h4>
                    <p className="text-gray-600">
                      View detailed report and product recommendations
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 md:p-12 text-white shadow-2xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Mission & Vision</h2>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              We are committed to providing intelligent, safe and effective
              skincare solutions for everyone.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
              <p className="opacity-90 leading-relaxed">
                Democratize skincare by using AI technology to provide
                professional skincare consultation for everyone, regardless of
                where they are.
              </p>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
              <p className="opacity-90 leading-relaxed">
                Become the leading platform for pharmaceutical and cosmetic
                management and sales with advanced AI technology in Vietnam and
                the region.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
