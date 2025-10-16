"use client";

import { useState } from "react";
import Link from "next/link";
import Select from "@/components/Select";
import { COUNTRIES } from "@/lib/countries";
import DefaultLayout from "@/layouts/DefaultLayout";

const COMPANY_SIZES = [
  "1-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-500 employees",
  "501-1000 employees",
  "1000+ employees"
];

const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Retail",
  "Manufacturing",
  "Consulting",
  "Marketing & Advertising",
  "Real Estate",
  "Other"
];

const EXPECTED_HIRES = [
  "1-5 hires",
  "6-10 hires",
  "11-20 hires",
  "20+ hires"
];

export default function CompanySignup() {
  const [formData, setFormData] = useState({
    companyName: "",
    companySize: "",
    industry: "",
    country: "",
    website: "",
    contactFirstName: "",
    contactLastName: "",
    contactEmail: "",
    contactPhone: "",
    jobTitle: "",
    hiringNeeds: "",
    expectedHires: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/company-signups`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit signup");
      }

      setSubmitSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <DefaultLayout>
        <div className="max-w-[600px] mx-auto px-6 py-24">
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-lg">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF6363] to-[#A855F7] flex items-center justify-center mx-auto mb-6">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h1>
            <p className="text-xl text-gray-600 mb-8">
              We&apos;ve received your application. Our team will review it and get back to you within 2-3 business days.
            </p>
            <Link 
              href="/" 
              className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="max-w-[800px] mx-auto px-6 py-32 lg:py-40">
        <div className="text-center mb-12">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
            Start <span className="gradient-text">Hiring</span> Today
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join hundreds of companies using Hatch Beacon to find top talent. Fill out the form below and we&apos;ll get you started.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
              {error}
            </div>
          )}

          {/* Company Information */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Company Information</h2>
            <div className="space-y-6">
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-900 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  required
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full py-3 px-4 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Acme Corporation"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="companySize" className="block text-sm font-medium text-gray-900 mb-2">
                    Company Size *
                  </label>
                  <Select
                    value={formData.companySize}
                    onChange={(value) => setFormData({ ...formData, companySize: value || "" })}
                    options={COMPANY_SIZES.map(size => ({ label: size, value: size }))}
                    placeholder="Select size"
                    ariaLabel="Company Size"
                  />
                </div>

                <div>
                  <label htmlFor="industry" className="block text-sm font-medium text-gray-900 mb-2">
                    Industry *
                  </label>
                  <Select
                    value={formData.industry}
                    onChange={(value) => setFormData({ ...formData, industry: value || "" })}
                    options={INDUSTRIES.map(industry => ({ label: industry, value: industry }))}
                    placeholder="Select industry"
                    ariaLabel="Industry"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-900 mb-2">
                    Country *
                  </label>
                  <Select
                    value={formData.country}
                    onChange={(value) => setFormData({ ...formData, country: value || "" })}
                    options={COUNTRIES.map(country => ({ label: country, value: country }))}
                    placeholder="Select country"
                    searchable={true}
                    ariaLabel="Country"
                  />
                </div>

                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-900 mb-2">
                    Website *
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    required
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full py-3 px-4 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mb-8 pt-8 border-t border-gray-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="contactFirstName" className="block text-sm font-medium text-gray-900 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="contactFirstName"
                    name="contactFirstName"
                    required
                    value={formData.contactFirstName}
                    onChange={handleChange}
                    className="w-full py-3 px-4 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="John"
                  />
                </div>

                <div>
                  <label htmlFor="contactLastName" className="block text-sm font-medium text-gray-900 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="contactLastName"
                    name="contactLastName"
                    required
                    value={formData.contactLastName}
                    onChange={handleChange}
                    className="w-full py-3 px-4 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-900 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  id="jobTitle"
                  name="jobTitle"
                  required
                  value={formData.jobTitle}
                  onChange={handleChange}
                  className="w-full py-3 px-4 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="HR Manager"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-900 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="contactEmail"
                    name="contactEmail"
                    required
                    value={formData.contactEmail}
                    onChange={handleChange}
                    className="w-full py-3 px-4 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-900 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="contactPhone"
                    name="contactPhone"
                    required
                    value={formData.contactPhone}
                    onChange={handleChange}
                    className="w-full py-3 px-4 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Hiring Needs */}
          <div className="mb-8 pt-8 border-t border-gray-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Hiring Needs</h2>
            <div className="space-y-6">
              <div>
                <label htmlFor="expectedHires" className="block text-sm font-medium text-gray-900 mb-2">
                  Expected Hires (Next 12 Months)
                </label>
                <Select
                  value={formData.expectedHires}
                  onChange={(value) => setFormData({ ...formData, expectedHires: value || "" })}
                  options={EXPECTED_HIRES.map(range => ({ label: range, value: range }))}
                  placeholder="Select range"
                  allowEmpty={true}
                  ariaLabel="Expected Hires"
                />
              </div>

              <div>
                <label htmlFor="hiringNeeds" className="block text-sm font-medium text-gray-900 mb-2">
                  Tell us about your hiring needs
                </label>
                <textarea
                  id="hiringNeeds"
                  name="hiringNeeds"
                  rows={4}
                  value={formData.hiringNeeds}
                  onChange={handleChange}
                  className="w-full py-3 px-4 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                  placeholder="What roles are you looking to fill? Any specific requirements?"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-4 px-6 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105"
            >
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </button>
            <Link
              href="/"
              className="flex-1 py-4 px-6 bg-gray-100 text-gray-900 rounded-xl font-semibold hover:bg-gray-200 transition-all text-center border border-gray-300"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </DefaultLayout>
  );
}
