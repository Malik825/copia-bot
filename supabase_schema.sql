-- 1. Create User Profiles Table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
    display_name VARCHAR(100) DEFAULT 'Jordan Smith',
    avatar_url VARCHAR(255) DEFAULT '👤',
    account_equity NUMERIC DEFAULT 0,
    theme VARCHAR(10) DEFAULT 'dark',
    max_exposure_percent NUMERIC DEFAULT 25,
    max_leverage_cap NUMERIC DEFAULT 20,
    slippage_limit_percent NUMERIC DEFAULT 0.15,
    max_position_size_usdt NUMERIC DEFAULT 1000,
    order_block_filter_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- In case tables already exist:
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS display_name VARCHAR(100) DEFAULT 'Jordan Smith';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(255) DEFAULT '👤';

-- Enable RLS for user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 2. Create Exchange Keys Table
CREATE TABLE IF NOT EXISTS public.exchange_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    exchange_name VARCHAR(50) NOT NULL,
    api_key VARCHAR(255) NOT NULL,
    api_secret VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS for exchange_keys
ALTER TABLE public.exchange_keys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own keys" ON public.exchange_keys;
CREATE POLICY "Users can view own keys" ON public.exchange_keys FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own keys" ON public.exchange_keys;
CREATE POLICY "Users can insert own keys" ON public.exchange_keys FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own keys" ON public.exchange_keys;
CREATE POLICY "Users can delete own keys" ON public.exchange_keys FOR DELETE USING (auth.uid() = user_id);

-- 3. Create Providers Table
CREATE TABLE IF NOT EXISTS public.providers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    avatar VARCHAR(10),
    market VARCHAR(50),
    total_trades INTEGER DEFAULT 0,
    win_rate NUMERIC DEFAULT 0,
    pnl_percentage NUMERIC DEFAULT 0,
    stars INTEGER DEFAULT 0,
    max_participants INTEGER DEFAULT 200,
    aum NUMERIC DEFAULT 0,
    mdd NUMERIC DEFAULT 0,
    sharpe NUMERIC DEFAULT 0
);

-- Providers are public read-only
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view providers" ON public.providers;
CREATE POLICY "Anyone can view providers" ON public.providers FOR SELECT USING (true);

-- Insert Mock Providers
INSERT INTO public.providers (id, name, avatar, market, total_trades, win_rate, pnl_percentage, stars, max_participants, aum, mdd, sharpe) 
VALUES 
('prov-01', 'Martin', '🚀', 'Crypto', 342, 88, 110, 196, 200, 1313234.78, 7.31, 7.63),
('prov-02', 'Larry', '🔮', 'Forex', 198, 82, 85, 190, 200, 31432.54, 14.50, 1.22),
('prov-03', 'Nancy', '⚡', 'Deriv', 512, 91, 142, 110, 150, 45543.84, 30.20, 4.15)
ON CONFLICT (id) DO NOTHING;

-- 4. Create User Subscriptions Table (Linked Providers)
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    provider_id VARCHAR(50) REFERENCES public.providers(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, provider_id)
);

-- Enable RLS for user_subscriptions
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.user_subscriptions;
CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON public.user_subscriptions;
CREATE POLICY "Users can insert own subscriptions" ON public.user_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own subscriptions" ON public.user_subscriptions;
CREATE POLICY "Users can delete own subscriptions" ON public.user_subscriptions FOR DELETE USING (auth.uid() = user_id);
