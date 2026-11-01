/**
 * @fileoverview Citizen registration page communicating with POST /api/auth/register.
 * Dynamic dropdowns populated strictly from OptionsContext (zero hardcoded enum lists).
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useOptions } from '../context/OptionsContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { UserPlus, ArrowRight } from 'lucide-react';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';
import Card, { CardBody } from '../components/common/Card.jsx';

export const RegisterPage = () => {
  const { register } = useAuth();
  const { options } = useOptions();
  const { success: toastSuccess, error: toastError } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    preferredLanguage: 'en',
    state: '',
    userCategory: 'general_citizen',
  });
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    const errors = {};
    if (!formData.name.trim()) errors.name = 'Full name is required';
    if (!formData.email.trim()) errors.email = 'Email address is required';
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/[a-zA-Z]/.test(formData.password) || !/\d/.test(formData.password)) {
      errors.password = 'Password must contain at least one letter and one number';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      preferredLanguage: formData.preferredLanguage || undefined,
      state: formData.state || undefined,
      userCategory: formData.userCategory || undefined,
    };

    const result = await register(payload);
    setLoading(false);

    if (result.success) {
      toastSuccess(`Account registered successfully! Welcome, ${result.user.name}.`);
      navigate('/', { replace: true });
    } else {
      const err = result.error;
      toastError(err.message || 'Registration failed. Please check form inputs.');

      if (err.details && Array.isArray(err.details)) {
        const mapped = {};
        err.details.forEach((d) => {
          if (d.field) mapped[d.field] = d.message;
        });
        setFieldErrors(mapped);
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 shadow-xs mb-1">
            <UserPlus className="w-6 h-6" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Create Citizen Account
          </h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Personalize scheme eligibility evaluations and save relevant government circulars.
          </p>
        </div>

        <Card className="border-slate-200 shadow-md">
          <CardBody className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <Input
                id="reg-name"
                name="name"
                label="Full Name"
                placeholder="Ramesh Kumar"
                value={formData.name}
                onChange={handleChange}
                error={fieldErrors.name}
                required
                autoComplete="name"
              />

              <Input
                id="reg-email"
                name="email"
                label="Email Address"
                type="email"
                placeholder="citizen@example.com"
                value={formData.email}
                onChange={handleChange}
                error={fieldErrors.email}
                required
                autoComplete="email"
              />

              <Input
                id="reg-password"
                name="password"
                label="Password"
                type="password"
                placeholder="Minimum 8 characters (letters + numbers)"
                value={formData.password}
                onChange={handleChange}
                error={fieldErrors.password}
                helperText="Must be at least 8 characters with at least one letter and one number"
                required
                autoComplete="new-password"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* State selector dynamically backed by OptionsContext */}
                <div className="space-y-1.5 text-left">
                  <label htmlFor="reg-state" className="block text-xs font-semibold text-slate-700">
                    State / Union Territory
                  </label>
                  <select
                    id="reg-state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 cursor-pointer"
                  >
                    <option value="">Select State (Optional)</option>
                    {(options?.states || []).map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Citizen category selector dynamically backed by OptionsContext */}
                <div className="space-y-1.5 text-left">
                  <label
                    htmlFor="reg-category"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Citizen Category
                  </label>
                  <select
                    id="reg-category"
                    name="userCategory"
                    value={formData.userCategory}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 cursor-pointer"
                  >
                    {(options?.userCategories || []).map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={loading}
                className="w-full mt-3"
              >
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4 ml-1.5" aria-hidden="true" />
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                Sign in here
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
