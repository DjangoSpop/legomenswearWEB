'use client';

/**
 * Registration Page
 * Allows new users to create accounts with role selection (buyer/seller)
 */

import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { RoleEnum } from '@/lib/types/api';

export default function RegisterPage() {
  const { register, loading: authLoading } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    role: 'buyer' as RoleEnum,
    firstName: '',
    lastName: '',
    shopname: '',
    shopdes: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSellerFields, setShowSellerFields] = useState(false);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle role change
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const role = e.target.value as RoleEnum;
    setFormData(prev => ({ ...prev, role }));
    setShowSellerFields(role === 'seller');
  };

  // Validate form
  const validateForm = (): string | null => {
    if (!formData.username.trim()) return 'Username is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(formData.email)) return 'Email is invalid';
    if (formData.password.length < 8) return 'Password must be at least 8 characters';
    if (formData.password !== formData.password_confirm) return 'Passwords do not match';
    
    if (formData.role === 'seller') {
      if (!formData.shopname.trim()) return 'Shop name is required for sellers';
    }
    
    return null;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      // Prepare registration data
      const registrationData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        password_confirm: formData.password_confirm,
        role: formData.role,
        first_name: formData.firstName.trim() || undefined,
        last_name: formData.lastName.trim() || undefined,
        ...(formData.role === 'seller' && {
          shopname: formData.shopname.trim(),
          shopdes: formData.shopdes.trim() || undefined,
        }),
      };

      await register(registrationData);
      // Context will handle redirect based on role
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-page py-12">
      <div className="max-w-2xl mx-auto">
        <div className="card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-light tracking-tight mb-2">Create Account</h1>
            <p className="text-brand-gray">Join LEGO Menswear today</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-accent-red/10 border border-accent-red text-accent-red text-sm rounded">
              {error}
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-brand-gray mb-2">
                Account Type
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleRoleChange}
                className="w-full px-4 py-3 border border-brand-gray/20 rounded focus:outline-none focus:border-brand-black transition-colors"
                required
              >
                <option value="buyer">Buyer - Shop for products</option>
                <option value="seller">Seller - Manage your store</option>
              </select>
              <p className="mt-2 text-xs text-brand-gray">
                {formData.role === 'buyer' 
                  ? 'Browse and purchase products from our sellers'
                  : 'Create and manage your own product listings'}
              </p>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                type="text"
                name="firstName"
                placeholder="John"
                value={formData.firstName}
                onChange={handleChange}
              />

              <Input
                label="Last Name"
                type="text"
                name="lastName"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>

            <Input
              label="Username"
              type="text"
              name="username"
              placeholder="Choose a unique username"
              value={formData.username}
              onChange={handleChange}
              required
            />

            <Input
              label="Email"
              type="email"
              name="email"
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />

            {/* Seller-Specific Fields */}
            {showSellerFields && (
              <div className="pt-4 border-t border-brand-gray/20 space-y-4">
                <h3 className="text-lg font-medium text-brand-black">Shop Information</h3>
                
                <Input
                  label="Shop Name"
                  type="text"
                  name="shopname"
                  placeholder="Your Store Name"
                  value={formData.shopname}
                  onChange={handleChange}
                  required={formData.role === 'seller'}
                />

                <div>
                  <label className="block text-sm font-medium text-brand-gray mb-2">
                    Shop Description
                  </label>
                  <textarea
                    name="shopdes"
                    placeholder="Describe your shop and products..."
                    value={formData.shopdes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-brand-gray/20 rounded focus:outline-none focus:border-brand-black transition-colors resize-none"
                  />
                </div>
              </div>
            )}

            {/* Password Fields */}
            <div className="pt-4 border-t border-brand-gray/20 space-y-4">
              <Input
                label="Password"
                type="password"
                name="password"
                placeholder="At least 8 characters"
                value={formData.password}
                onChange={handleChange}
                required
              />

              <Input
                label="Confirm Password"
                type="password"
                name="password_confirm"
                placeholder="Re-enter your password"
                value={formData.password_confirm}
                onChange={handleChange}
                required
              />
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              variant="primary" 
              fullWidth 
              loading={loading || authLoading}
              disabled={loading || authLoading}
            >
              Create Account
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-8 text-center border-t border-brand-gray/20 pt-6">
            <p className="text-sm text-brand-gray">
              Already have an account?{' '}
              <Link 
                href="/login" 
                className="text-brand-black font-medium hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
