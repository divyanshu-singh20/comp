import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, LayoutDashboard, Loader2, Lock, Mail, ShieldCheck } from 'lucide-react';
import { postJson } from '../lib/api';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field) => (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const signIn = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.email.trim() || !form.password) {
      setError('Email and password are required.');
      return;
    }

    setSubmitting(true);

    try {
      const { token, user } = await postJson('/api/auth/login', {
        email: form.email.trim().toLowerCase(),
        password: form.password
      });

      localStorage.setItem('leadyfy_token', token);
      localStorage.setItem('leadyfy_user', JSON.stringify(user));
      navigate(user.role === 'Client' ? '/portal' : '/', { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#111111] px-5 py-12">
      <div className="w-full max-w-md">
        <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-8 shadow-2xl shadow-black/50">
          <div className="flex flex-col items-center text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-amber-500/10 text-[#F59E0B]">
              <LayoutDashboard size={26} strokeWidth={1.8} />
            </span>
            <h1 className="mt-5 text-2xl font-bold tracking-tight text-white">Welcome back</h1>
            <p className="mt-2 text-sm text-neutral-400">Sign in to your Leadyfy OS workspace</p>
          </div>

          <form onSubmit={signIn} className="mt-8 space-y-5" noValidate>
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
                  className="h-11 w-full rounded-lg border border-neutral-800 bg-[#111111] pl-10 pr-3.5 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-medium text-neutral-300">Password</span>
              <div className="relative">
                <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={updateField('password')}
                  placeholder="Enter your password"
                  className="h-11 w-full rounded-lg border border-neutral-800 bg-[#111111] pl-10 pr-3.5 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]"
                />
              </div>
            </label>

            {error && (
              <p role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="group flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#F59E0B] text-sm font-semibold text-black transition-all hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (<><Loader2 size={16} className="animate-spin" /> Signing in...</>) : (<>Sign in <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" /></>)}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-center gap-2 border-t border-neutral-800 pt-5 text-[11px] text-neutral-500">
            <ShieldCheck size={13} /> Secured with JWT authentication
          </div>
        </section>

        <p className="mt-6 text-center text-sm text-neutral-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-[#F59E0B] transition-colors hover:text-amber-400">Create one now</Link>
        </p>
      </div>
    </main>
  );
}