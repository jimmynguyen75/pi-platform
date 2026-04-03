import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Eye, EyeOff, TrendingUp, Shield, BarChart3 } from 'lucide-react';
import { login } from '../../api/auth';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { cn } from '../../lib/utils';

const DEMO_ACCOUNTS = [
  { label: 'Admin', sub: 'Full access', email: 'admin@company.com', password: 'password123', color: '#7c3aed', bg: '#f5f3ff' },
  { label: 'Manager', sub: 'Software domain', email: 'david.kim@company.com', password: 'password123', color: '#4f46e5', bg: '#eef2ff' },
  { label: 'Manager', sub: 'Cloud & Security', email: 'michael.zhang@company.com', password: 'password123', color: '#0891b2', bg: '#ecfeff' },
];

const FEATURES = [
  { icon: TrendingUp, title: 'Smart Portfolio Management', desc: 'Track partner health scores and risk in real-time' },
  { icon: BarChart3,  title: 'Executive Insights',         desc: 'Org view, workload analysis, and activity trends' },
  { icon: Shield,     title: 'Automated Risk Detection',   desc: 'Instant alerts when partnerships need attention' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await login(email, password);
      setAuth(res.user, res.token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col flex-1 bg-slate-950 p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full border border-indigo-500/10" />
          <div className="absolute -bottom-48 -right-48 w-[700px] h-[700px] rounded-full border border-purple-500/8" />
          <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] rounded-full bg-indigo-600/5 blur-3xl" />
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3 mb-16">
          <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center text-white font-black text-base shadow-lg shadow-indigo-900/40">
            PI
          </div>
          <div>
            <p className="text-white font-bold text-base leading-tight">Partner Intelligence</p>
            <p className="text-slate-500 text-xs">Platform</p>
          </div>
        </div>

        {/* Headline */}
        <div className="relative flex-1 flex flex-col justify-center max-w-md">
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Manage partnerships<br />
            <span className="gradient-text">with confidence</span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed mb-12">
            A modern platform for tracking partner relationships, health scores, and collaboration activity.
          </p>

          <div className="space-y-5">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-white/6 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{title}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-slate-600 text-xs">
          © {new Date().getFullYear()} PI Platform · Internal use only
        </p>
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-[460px] flex flex-col justify-center px-8 sm:px-12 lg:px-14 bg-white">
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2.5 mb-10">
          <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center text-white font-black text-sm">PI</div>
          <span className="font-bold text-gray-900">Partner Intelligence</span>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
          <p className="text-gray-500 text-sm mt-1">Sign in to your account to continue</p>
        </div>

        {error && (
          <Alert variant="danger" className="mb-5">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="h-10"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type={showPwd ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="h-10"
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />
          </div>

          <Button type="submit" size="lg" loading={loading} className="w-full mt-2">
            Sign In
          </Button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center gap-3 my-7">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs text-gray-400 font-medium">Demo Accounts</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        {/* Demo accounts */}
        <div className="space-y-2">
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.email}
              type="button"
              onClick={() => { setEmail(acc.email); setPassword(acc.password); }}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-150 group',
                'hover:shadow-sm active:scale-[0.99]'
              )}
              style={{ background: acc.bg, borderColor: `${acc.color}20` }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ background: acc.color }}
              >
                {acc.label[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-none" style={{ color: acc.color }}>{acc.label}</p>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{acc.sub} · {acc.email}</p>
              </div>
              <Zap size={13} style={{ color: acc.color }} className="opacity-60 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-5">
          All demo accounts use password: <span className="font-semibold text-gray-600">password123</span>
        </p>
      </div>
    </div>
  );
}
