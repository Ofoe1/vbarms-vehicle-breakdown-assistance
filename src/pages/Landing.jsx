import { useNavigate } from "react-router-dom";
import { Shield, Users, Zap, MapPin, Clock, Award } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-trust-900 via-trust-800 to-trust-900 text-white">
      {/* Header */}
      <header className="border-b border-trust-700 bg-trust-900/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-amber-400" />
            <span className="text-2xl font-bold font-heading">VBARMS</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-2 rounded-lg text-trust-900 bg-white font-semibold hover:bg-trust-50 transition"
            >
              Sign in
            </button>
            <button
              onClick={() => navigate("/register")}
              className="px-6 py-2 rounded-lg border-2 border-white text-white font-semibold hover:bg-white/10 transition"
            >
              Register
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl font-bold font-heading mb-4 text-amber-300">
          Roadside Assistance, Matched Right
        </h1>
        <p className="text-xl text-trust-200 mb-8 max-w-2xl mx-auto">
          VBARMS connects drivers in distress with the most qualified local providers in seconds.
          Real expertise. Real speed. Real peace of mind.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate("/register")}
            className="px-8 py-3 rounded-lg bg-amber-400 text-trust-900 font-bold text-lg hover:bg-amber-300 transition"
          >
            Get Started
          </button>
          <button
            onClick={() => navigate("/login")}
            className="px-8 py-3 rounded-lg border-2 border-amber-400 text-amber-400 font-bold text-lg hover:bg-amber-400/10 transition"
          >
            Sign In
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold font-heading text-center mb-12">Why VBARMS?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-trust-800/50 border border-trust-700 p-8 rounded-xl">
            <Zap className="w-10 h-10 text-amber-400 mb-4" />
            <h3 className="text-xl font-bold font-heading mb-2">Smart Matching</h3>
            <p className="text-trust-200">
              Our algorithm ranks providers by specialization and experience, ensuring you get the best fit.
            </p>
          </div>
          <div className="bg-trust-800/50 border border-trust-700 p-8 rounded-xl">
            <Clock className="w-10 h-10 text-amber-400 mb-4" />
            <h3 className="text-xl font-bold font-heading mb-2">Quick Response</h3>
            <p className="text-trust-200">
              Available providers are notified instantly. Average response time under 5 minutes.
            </p>
          </div>
          <div className="bg-trust-800/50 border border-trust-700 p-8 rounded-xl">
            <Users className="w-10 h-10 text-amber-400 mb-4" />
            <h3 className="text-xl font-bold font-heading mb-2">Trusted Network</h3>
            <p className="text-trust-200">
              All providers are verified professionals with proven track records and customer reviews.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-12">
          <div className="bg-trust-800/50 border border-trust-700 p-8 rounded-xl">
            <Users className="w-10 h-10 text-amber-400 mb-4" />
            <h3 className="text-xl font-bold font-heading mb-4">For Drivers</h3>
            <ul className="space-y-2 text-trust-200">
              <li className="flex items-center gap-2">
                <MapPin size={16} className="text-amber-400" />
                Report breakdowns instantly
              </li>
              <li className="flex items-center gap-2">
                <Award size={16} className="text-amber-400" />
                Track provider expertise
              </li>
              <li className="flex items-center gap-2">
                <Clock size={16} className="text-amber-400" />
                See real-time status updates
              </li>
            </ul>
          </div>
          <div className="bg-trust-800/50 border border-trust-700 p-8 rounded-xl">
            <Shield className="w-10 h-10 text-amber-400 mb-4" />
            <h3 className="text-xl font-bold font-heading mb-4">For Providers</h3>
            <ul className="space-y-2 text-trust-200">
              <li className="flex items-center gap-2">
                <Zap size={16} className="text-amber-400" />
                Gain qualified job requests
              </li>
              <li className="flex items-center gap-2">
                <Award size={16} className="text-amber-400" />
                Build your reputation
              </li>
              <li className="flex items-center gap-2">
                <Clock size={16} className="text-amber-400" />
                Manage your workload
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-trust-700 bg-trust-900/50 mt-20">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-trust-400">
          <p>&copy; 2024 VBARMS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
