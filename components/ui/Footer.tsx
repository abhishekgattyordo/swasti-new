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
import { useTenant } from "@/contexts/TenantContext";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { tenant, isLoading } = useTenant();
  const tenantName = tenant?.name || "";


  const quickLinks = [
    { href: "/", label: "Home" },
    { href: "/doctors", label: "Find Doctors" },
    { href: "/services", label: "Services" },
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
  ];

  const services = [
    { href: "/consult", label: "Online Consultation" },
    { href: "/appointments", label: "Book Appointment" },
    { href: "/emergency", label: "Emergency Care" },
    { href: "/lab-tests", label: "Lab Tests" },
    { href: "/pharmacy", label: "Pharmacy" },
  ];

  const contactInfo = [
    { icon: Phone, text: "+1 (555) 123-4567", href: "tel:+15551234567" },
    { icon: Mail, text: "support@ordo-his.com", href: "mailto:support@ordo-his.com" },
    { icon: MapPin, text: "123 Medical Center Dr, Healthcare City, HC 12345" },
    { icon: Clock, text: "24/7 Emergency Services", highlight: true },
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="h-10 w-10 bg-gradient-to-r from-green-600 to-green-400 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
                {tenantName}
                </span>
                <p className="text-xs text-gray-500 -mt-1">
                  Healthcare Information System
                </p>
              </div>
            </Link>
            
            <p className="text-sm text-gray-400 leading-relaxed">
              Transforming healthcare delivery with integrated solutions. 
              Trusted by over 50,000 patients and 500+ healthcare providers.
            </p>

            {/* Trust Badge */}
            <div className="flex items-center gap-2 bg-gray-800/50 p-3 rounded-lg border border-gray-700">
              <Shield className="w-5 h-5 text-green-400 flex-shrink-0" />
              <p className="text-xs text-gray-300">
                HIPAA Compliant • ISO 27001 Certified • 256-bit Encryption
              </p>
            </div>

            {/* Social Links */}
            <div className="flex gap-3 pt-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="bg-gray-800 p-2 rounded-lg hover:bg-green-600 transition-all duration-300 group"
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <social.icon className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span className="w-6 h-0.5 bg-green-500"></span>
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-green-400 transition-colors flex items-center gap-2 group"
                  >
                    <ChevronRight className="w-3 h-3 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Column */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span className="w-6 h-0.5 bg-green-500"></span>
              Our Services
            </h3>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service.href}>
                  <Link
                    href={service.href}
                    className="text-sm text-gray-400 hover:text-green-400 transition-colors flex items-center gap-2 group"
                  >
                    <ChevronRight className="w-3 h-3 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {service.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span className="w-6 h-0.5 bg-green-500"></span>
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
                          item.highlight ? 'text-green-400' : 'text-gray-400 hover:text-green-400'
                        } transition-colors`}
                      >
                        <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                          item.highlight ? 'text-green-500' : 'text-gray-500 group-hover:text-green-500'
                        }`} />
                        <span>{item.text}</span>
                      </a>
                    ) : (
                      <div className={`flex items-start gap-3 text-sm ${
                        item.highlight ? 'text-green-400' : 'text-gray-400'
                      }`}>
                        <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                          item.highlight ? 'text-green-500' : 'text-gray-500'
                        }`} />
                        <span>{item.text}</span>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>

            {/* Newsletter CTA */}
            <div className="mt-6 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
              <p className="text-xs text-gray-300 mb-2">
                Get health tips and updates
              </p>
              <Link
                href="/newsletter"
                className="inline-flex items-center gap-2 text-xs font-medium text-green-400 hover:text-green-300 transition-colors"
              >
                Subscribe to Newsletter
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-xs text-gray-500 text-center md:text-left">
              &copy; {currentYear} Ordo HIS. All rights reserved. 
              <span className="mx-2">|</span>
              <Link href="/privacy" className="hover:text-green-400 transition-colors">
                Privacy Policy
              </Link>
              <span className="mx-2">|</span>
              <Link href="/terms" className="hover:text-green-400 transition-colors">
                Terms of Service
              </Link>
            </p>
            
            <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
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