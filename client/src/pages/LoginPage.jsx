/**
 * @fileoverview Citizen and administrator login page communicating with POST /api/auth/login.
 */

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { LogIn, ArrowRight } from 'lucide-react';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';
import Card, { CardBody } from '../components/common/Card.jsx';

export const LoginPage = () => {
  const { login } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    const errors = {};
    if (!email.trim()) errors.email = 'Email address is required';
    if (!password) errors.password = 'Password is required';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    const result = await login({ email: email.trim(), password });
    setLoading(false);

    if (result.success) {
      toastSuccess(`Welcome back, ${result.user.name || result.user.email}!`);
      navigate(from, { replace: true });
    } else {
      const err = result.error;
      toastError(err.message || 'Login failed. Please verify your credentials.');

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
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 shadow-xs mb-1">
            <LogIn className="w-6 h-6" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Sign in to JanSathi AI
          </h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Access citizen scheme discovery, eligibility evaluations, and official circulars.
          </p>
        </div>

        <Card className="border-slate-200 shadow-md">
          <CardBody className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <Input
                id="login-email"
                label="Email Address"
                type="email"
                placeholder="citizen@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={fieldErrors.email}
                required
                autoComplete="email"
              />

              <Input
                id="login-password"
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={fieldErrors.password}
                required
                autoComplete="current-password"
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={loading}
                className="w-full mt-2"
              >
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4 ml-1.5" aria-hidden="true" />
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
              Don&apos;t have an account?{' '}
              <Link
                to="/register"
                className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                Register as a citizen
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
