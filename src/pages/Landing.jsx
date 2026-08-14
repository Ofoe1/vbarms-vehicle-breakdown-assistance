import { useNavigate } from "react-router-dom";
import { Shield, Users, Zap, MapPin, Clock, Award } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-trust-900 via-trust-800 to-trust-900 text-white">
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

      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold font-heading text-center mb-12">Why VBARMS?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-trust-800/50 border border-trust-700 p-8 rounded-xl">
            <Zap className="w-10 h-10 text-amber-400 mb-4" />
            <h3 className="text-xl font-bold font-heading mb-2">Structured Breakdown Reporting</h3>
            <p className="text-trust-200">
              Report your breakdown with its type and location, and immediately see providers who offer the matching service.
            </p>
          </div>
          <div className="bg-trust-800/50 border border-trust-700 p-8 rounded-xl">
            <Users className="w-10 h-10 text-amber-400 mb-4" />
            <h3 className="text-xl font-bold font-heading mb-2">Choose Your Provider</h3>
            <p className="text-trust-200">
              Review the available providers ranked by experience, then assign the one you trust to help.
            </p>
          </div>
          <div className="bg-trust-800/50 border border-trust-700 p-8 rounded-xl">
            <Clock className="w-10 h-10 text-amber-400 mb-4" />
            <h3 className="text-xl font-bold font-heading mb-2">Live Status Tracking</h3>
            <p className="text-trust-200">
              Follow your request through a clear state workflow — Reported → Assigned → Accepted → In Progress → Completed.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-12">
          <div className="bg-trust-800/50 border border-trust-700 p-8 rounded-xl">
            <MapPin className="w-10 h-10 text-amber-400 mb-4" />
            <h3 className="text-xl font-bold font-heading mb-4">For Drivers</h3>
            <ul className="space-y-2 text-trust-200">
              <li className="flex items-center gap-2">
                <MapPin size={16} className="text-amber-400" />
                Report breakdowns with type and text location
              </li>
              <li className="flex items-center gap-2">
                <Users size={16} className="text-amber-400" />
                Pick from providers filtered by service type
              </li>
              <li className="flex items-center gap-2">
                <Clock size={16} className="text-amber-400" />
                Track the request through its live status workflow
              </li>
            </ul>
          </div>
          <div className="bg-trust-800/50 border border-trust-700 p-8 rounded-xl">
            <Award className="w-10 h-10 text-amber-400 mb-4" />
            <h3 className="text-xl font-bold font-heading mb-4">For Providers</h3>
            <ul className="space-y-2 text-trust-200">
              <li className="flex items-center gap-2">
                <Zap size={16} className="text-amber-400" />
                Receive assigned assistance requests
              </li>
              <li className="flex items-center gap-2">
                <Shield size={16} className="text-amber-400" />
                Accept or reject each assignment
              </li>
              <li className="flex items-center gap-2">
                <Clock size={16} className="text-amber-400" />
                Manage your availability and service history
              </li>
            </ul>
          </div>
        </div>
      </section>

      <footer className="border-t border-trust-700 bg-trust-900/50 mt-20">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-trust-400">
          <p>&copy; 2024 VBARMS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}