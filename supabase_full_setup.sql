-- ============================================================
-- LootLog — Full Database Setup (fresh Supabase project)
-- Copy-paste this entire script into Supabase SQL Editor
-- ============================================================

-- ========================
-- 1. UTILITY FUNCTION
-- ========================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ========================
-- 2. TABLES
-- ========================

-- Transactions (achats de jeux)
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    title TEXT NOT NULL,
    platform TEXT NOT NULL DEFAULT 'PC',
    price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'EUR',
    store TEXT DEFAULT 'Steam',
    purchase_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'Backlog',
    notes TEXT DEFAULT '',
    genre TEXT DEFAULT 'Other',
    rating INTEGER DEFAULT NULL CHECK (rating IS NULL OR (rating >= 1 AND rating <= 10)),
    hours_played NUMERIC(8, 1) DEFAULT 0,
    cover_url TEXT DEFAULT NULL,
    type TEXT DEFAULT 'game',
    parent_game_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    priority TEXT DEFAULT NULL,
    target_price NUMERIC(10, 2) DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Budgets mensuels
CREATE TABLE IF NOT EXISTS budgets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL,
    amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'EUR',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(month, year, user_id)
);

-- Profiles utilisateurs
CREATE TABLE IF NOT EXISTS profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
    display_name TEXT DEFAULT '',
    avatar TEXT DEFAULT '🎮',
    default_currency TEXT DEFAULT 'EUR' CHECK (default_currency IN ('EUR', 'USD', 'GBP', 'JPY')),
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions (freemium)
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
    plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NULL,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gaming Subscriptions (abonnements gaming récurrents)
CREATE TABLE IF NOT EXISTS gaming_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    service_name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'gaming',
    platform TEXT NOT NULL DEFAULT 'PC',
    price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'EUR',
    billing_cycle TEXT NOT NULL DEFAULT 'monthly',
    payment_method TEXT DEFAULT NULL,
    start_date DATE DEFAULT CURRENT_DATE,
    next_renewal DATE DEFAULT NULL,
    auto_renewal BOOLEAN DEFAULT TRUE,
    status TEXT NOT NULL DEFAULT 'active',
    notes TEXT DEFAULT '',
    renewal_reminders BOOLEAN DEFAULT FALSE,
    tags TEXT[] DEFAULT '{}',
    color TEXT DEFAULT '#FF5C00',
    icon_url TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================
-- 3. INDEXES
-- ========================

-- Transactions
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_purchase_date ON transactions(purchase_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_platform ON transactions(platform);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_genre ON transactions(genre);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_parent_game_id ON transactions(parent_game_id);

-- Budgets
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_month_year ON budgets(month, year);

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- Subscriptions (Stripe)
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);

-- Gaming Subscriptions
CREATE INDEX IF NOT EXISTS idx_gaming_subscriptions_user_id ON gaming_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_gaming_subscriptions_status ON gaming_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_gaming_subscriptions_next_renewal ON gaming_subscriptions(next_renewal);

-- ========================
-- 4. TRIGGERS (auto updated_at)
-- ========================

CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at
    BEFORE UPDATE ON budgets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gaming_subscriptions_updated_at
    BEFORE UPDATE ON gaming_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================
-- 5. ROW LEVEL SECURITY
-- ========================

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gaming_subscriptions ENABLE ROW LEVEL SECURITY;

-- Transactions
CREATE POLICY "Users can view own transactions"
    ON transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
    ON transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
    ON transactions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
    ON transactions FOR DELETE
    USING (auth.uid() = user_id);

-- Budgets
CREATE POLICY "Users can view own budgets"
    ON budgets FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets"
    ON budgets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets"
    ON budgets FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets"
    ON budgets FOR DELETE
    USING (auth.uid() = user_id);

-- Profiles
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Subscriptions
CREATE POLICY "Users can view own subscription"
    ON subscriptions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
    ON subscriptions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
    ON subscriptions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Gaming Subscriptions
CREATE POLICY "Users can view own gaming subscriptions"
    ON gaming_subscriptions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gaming subscriptions"
    ON gaming_subscriptions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gaming subscriptions"
    ON gaming_subscriptions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own gaming subscriptions"
    ON gaming_subscriptions FOR DELETE
    USING (auth.uid() = user_id);
