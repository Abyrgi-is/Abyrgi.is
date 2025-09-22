'use client'

import React, { useState } from "react";
import { supabaseClient } from "@/utils/supabase/supabase-library";

const SignupForm: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate name
    if (!name || name.trim().length === 0) {
      setError("Please enter your name.");
      return;
    }

    // Validate email
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Validate password
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      // Step 1: Sign up the user in Supabase Auth
      const { data: authData, error: authError } = await supabaseClient.signUp(email, password);

      if (authError) {
        console.error("Supabase Error (Sign Up):", authError);
        setError(authError.message);
        return;
      }

      // Step 2: Add user details to the custom Users table
      console.log("Data being sent to Users table:", {
        name,
        email,
        password, 
        phone_number: phone,
        address,
      });

      const { data: userData, error: userError } = await supabaseClient.addUserToUsersTable({
        name,
        email,
        password, 
        phone_number: phone,
        address,
      });

      console.log("Supabase Response (Add User):", { userData, userError });

      if (userError) {
        console.error("Supabase Error (Add User):", userError);
        setError(userError.message || "An error occurred while adding the user.");
        return;
      }

      setSuccess("Sign-up successful! Please check your email to confirm your account.");
    } catch (err) {
      console.error("Unexpected Error:", err);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Create an Account</h2>
      {error && <p className="text-red-500 text-center">{error}</p>}
      {success && <p className="text-green-500 text-center">{success}</p>}
      <form
        onSubmit={handleSubmit}
        className="max-w-md mx-auto p-6 bg-white rounded-lg shadow border border-gray-200 space-y-4"
      >
        <div className="space-y-1">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            Address
          </label>
          <input
            id="address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone
          </label>
          <input
            id="phone"
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Sign Up
        </button>
      </form>
    </>
  );
};

export default SignupForm;