import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaGithub,
} from "react-icons/fa";

export default function Footer() {
  return (
    <section className="bg-white">
      <div className="max-w-7xl px-4 py-12 mx-auto space-y-8 overflow-hidden sm:px-6 lg:px-8">

        {/* Navigation Links */}
        <nav className="flex flex-wrap justify-center -mx-5 -my-2">
          <div className="px-5 py-2">
            <a href="#" className="text-base text-gray-500 hover:text-gray-900">
              About
            </a>
          </div>

          <div className="px-5 py-2">
            <a href="#" className="text-base text-gray-500 hover:text-gray-900">
              Blog
            </a>
          </div>

          <div className="px-5 py-2">
            <a href="#" className="text-base text-gray-500 hover:text-gray-900">
              Team
            </a>
          </div>

          <div className="px-5 py-2">
            <a href="#" className="text-base text-gray-500 hover:text-gray-900">
              Contact
            </a>
          </div>
        </nav>

        {/* Social Icons */}
        <div className="flex justify-center mt-8 space-x-6 text-gray-400">
          <a href="#" className="hover:text-gray-500">
            <span className="sr-only">Facebook</span>
            <FaFacebook className="w-6 h-6" />
          </a>

          <a href="#" className="hover:text-gray-500">
            <span className="sr-only">Instagram</span>
            <FaInstagram className="w-6 h-6" />
          </a>

          <a href="#" className="hover:text-gray-500">
            <span className="sr-only">Twitter</span>
            <FaTwitter className="w-6 h-6" />
          </a>

          <a href="#" className="hover:text-gray-500">
            <span className="sr-only">GitHub</span>
            <FaGithub className="w-6 h-6" />
          </a>
        </div>

        {/* Footer Text */}
        <p className="mt-8 text-base text-center text-gray-400">
          © 2021 Smart Attendance System, Inc. All rights reserved.
        </p>

      </div>
    </section>
  );
}