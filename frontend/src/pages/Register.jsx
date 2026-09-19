import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Loader2, Lock, Mail, User, UserCog } from 'lucide-react';
import { postJson } from '../lib/api';

// Public self-registration roles. Owner/Admin accounts must be provisioned
// through the seed or an admin workflow, so the backend returns a 403 for those
// roles and the error banner surfaces that guidance gracefully.
const REGISTRATION_ROLES = [
  { value: 'Client', label: 'Client' },
  { value: 'ScriptWriter', label: 'Script Writer' },
  { value: 'ShootManager', label: 'Operations / Shoot Manager' },
  { value: 'Editor', label: 'Editor' },
  { value: 'Admin', label: 'Admin (provisioned by owner)' }
];

const initialForm = { name: '', email: '', password: '', confirmPassword: '', role: 'Client' };

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field) => (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));

  // Give the user a moment to read the success message before redirecting.
  useEffect(() => {
    if (!success) return undefined;
    const timer = setTimeout(() => navigate('/login', { replace: true }), 1600);
    return () => clearTimeout(timer);
  }, [success, navigate]);

  const validate = () => {
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      return 'Name, email, and password are required.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      return 'Please enter a valid email address.';
    }
    if (form.password.length < 8) {
      return 'Password must be at least 8 characters long.';
    }
    if (form.password !== form.confirmPassword) {
      return 'Passwords do not match.';
    }
    return '';
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);

    try {
      const data = await postJson('/api/auth/register', {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role
      });

      setSuccess(data?.message || 'User registered successfully. Redirecting you to sign in...');
      setForm(initialForm);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = 'h-11 w-full rounded-lg border border-neutral-800 bg-[#111111] pl-10 pr-3.5 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]';

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#111111] px-5 py-12">
      <div className="w-full max-w-md">
        <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-8 shadow-2xl shadow-black/50">
          <div className="flex flex-col items-center text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-amber-500/10 text-[#F59E0B]">
              <UserCog size={26} strokeWidth={1.8} />
            </span>
            <h1 className="mt-5 text-2xl font-bold tracking-tight text-white">Create your account</h1>
            <p className="mt-2 text-sm text-neutral-400">Join the Leadyfy OS workspace in a few seconds</p>
          </div>

          <form onSubmit={submit} className="mt-8 space-y-5" noValidate>
            <label className="block">
              <span className="mb-2 block text-xs font-medium text-neutral-300">Full name</span>
              <div className="relative">
                <User size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  name="name"
                  autoComplete="name"
                  value={form.name}
                  onChange={updateField('name')}
                  placeholder="Aarav Kapoor"
                  className={inputClass}
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-medium text-neutral-300">Email address</span>
              <div className="relative">
                <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={updateField('email')}
                  placeholder="you@leadyfy.com"
                  className={inputClass}
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-medium text-neutral-300">Workspace role</span>
              <div className="relative">
                <UserCog size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                <select
                  name="role"
                  value={form.role}
                  onChange={updateField('role')}
                  className={`${inputClass} appearance-none`}
                >
                  {REGISTRATION_ROLES.map(({ value, label }) => (
                    <option key={value} value={value} className="bg-neutral-900">{label}</option>
                  ))}
                </select>
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-medium text-neutral-300">Password</span>
              <div className="relative">
                <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="password"
                  name="password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={updateField('password')}
                  placeholder="Minimum 8 characters"
                  className={inputClass}
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-medium text-neutral-300">Confirm password</span>
              <div className="relative">
                <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="password"
                  name="confirmPassword"
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={updateField('confirmPassword')}
                  placeholder="Repeat your password"
                  className={inputClass}
                />
              </div>
            </label>

            {error && (
              <p role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">{error}</p>
            )}

            {success && (
              <p role="status" className="flex items-start gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-400">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> {success}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || Boolean(success)}
              className="group flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#F59E0B] text-sm font-semibold text-black transition-all hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (<><Loader2 size={16} className="animate-spin" /> Registering...</>) : (<>Create account <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" /></>)}
            </button>
          </form>
        </section>

        <p className="mt-6 text-center text-sm text-neutral-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[#F59E0B] transition-colors hover:text-amber-400">Sign in</Link>
        </p>
      </div>
    </main>
  );
}