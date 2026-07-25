"use client";

import Link from "next/link";
import {
  Heart,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ChevronRight,
  Clock,
  Shield,
} from "lucide-react";
import { useTenant } from "@/context/TenantContext";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { tenant } = useTenant();
  const tenantName = tenant?.name || "swasti.ai";

  const quickLinks = [
    { href: "/", label: "Home" },
    { href: "/appointments", label: "Find Doctors" },
    { href: "/services", label: "Services" },
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
  ];

  const services = [
    { href: "/appointments", label: "Online Consultation" },
    { href: "/appointments", label: "Book Appointment" },
    { href: "/emergency", label: "Emergency Care" },
    { href: "/lab-tests", label: "Lab Tests" },
    { href: "/pharmacy", label: "Pharmacy" },
  ];

  const contactInfo = [
    { icon: Phone, text: "+919731641766", href: "tel:+919731641766" },
    { icon: Mail, text: "swastihis.ai", href: "mailto:swastihis.ai@gmail.com" },
    { icon: Clock, text: "24/7 Emergency Services", highlight: true },
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
  ];

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-12">
          {/* Brand Column – exact match with Header */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-14 h-14 flex items-center justify-center">
                <img
                  src="/swasti ai logo.png"
                  alt="swasti.ai Logo"
                  className="w-full h-full object-contain transition-transform group-hover:scale-105 duration-200"
                />
              </div>
              <div>
                <span className="text-xl font-bold text-white">
                  swasti.ai
                </span>
                <p className="text-[10px] text-teal-400 -mt-0.5 tracking-wide">
                  AI-BASED HOSPITAL INFORMATION SYSTEM
                </p>
              </div>
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed">
              Transforming healthcare delivery with integrated AI solutions.
              Trusted by over 50,000 patients and 500+ healthcare providers.
            </p>

            {/* Trust Badge */}
            <div className="flex items-center gap-2 bg-slate-800/50 p-3 rounded-2xl border border-slate-700">
              <Shield className="w-5 h-5 text-teal-400 flex-shrink-0" />
              <p className="text-xs text-slate-300">
                HIPAA Compliant • ISO 27001 Certified • 256-bit Encryption
              </p>
            </div>

            {/* Social Links */}
            <div className="flex gap-3 pt-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="bg-slate-800 p-2 rounded-xl hover:bg-teal-600/30 transition-all duration-300 group"
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <social.icon className="w-4 h-4 text-slate-400 group-hover:text-teal-400 transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span className="w-6 h-0.5 bg-teal-400"></span>
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-teal-400 transition-colors flex items-center gap-2 group"
                  >
                    <ChevronRight className="w-3 h-3 text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span className="w-6 h-0.5 bg-teal-400"></span>
              Our Services
            </h3>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service.href}>
                  <Link
                    href={service.href}
                    className="text-sm text-slate-400 hover:text-teal-400 transition-colors flex items-center gap-2 group"
                  >
                    <ChevronRight className="w-3 h-3 text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {service.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span className="w-6 h-0.5 bg-teal-400"></span>
              Contact Us
            </h3>
            <ul className="space-y-4">
              {contactInfo.map((item, index) => {
                const Icon = item.icon;
                return (
                  <li key={index}>
                    {item.href ? (
                      <a
                        href={item.href}
                        className={`flex items-start gap-3 text-sm group ${
                          item.highlight ? 'text-teal-400' : 'text-slate-400 hover:text-teal-400'
                        } transition-colors`}
                      >
                        <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                          item.highlight ? 'text-teal-400' : 'text-slate-500 group-hover:text-teal-400'
                        }`} />
                        <span>{item.text}</span>
                      </a>
                    ) : (
                      <div className={`flex items-start gap-3 text-sm ${
                        item.highlight ? 'text-teal-400' : 'text-slate-400'
                      }`}>
                        <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                          item.highlight ? 'text-teal-400' : 'text-slate-500'
                        }`} />
                        <span>{item.text}</span>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>

          
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-xs text-slate-500 text-center md:text-left">
              &copy; {currentYear} {tenantName}. All rights reserved.
              <span className="mx-2">|</span>
              <Link href="/privacy" className="hover:text-teal-400 transition-colors">
                Privacy Policy
              </Link>
              <span className="mx-2">|</span>
              <Link href="/terms" className="hover:text-teal-400 transition-colors">
                Terms of Service
              </Link>
            </p>

            <div className="flex items-center justify-center gap-4 text-xs text-slate-600">
              <span>Version 2.0.0</span>
              <span>•</span>
              <span>Made with <Heart className="w-3 h-3 inline text-red-500" /> for better healthcare</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}