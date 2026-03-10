import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export function useAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
    };

    const signUp = async (email, password) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        return data;
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    };

    const deleteAccount = async () => {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) throw new Error('Not authenticated');
        const uid = currentUser.id;

        await supabase.from('transactions').delete().eq('user_id', uid);
        await supabase.from('budgets').delete().eq('user_id', uid);
        await supabase.from('gaming_subscriptions').delete().eq('user_id', uid);
        await supabase.from('subscriptions').delete().eq('user_id', uid);
        await supabase.from('profiles').delete().eq('user_id', uid);

        const { error: rpcError } = await supabase.rpc('delete_user');
        if (rpcError) throw rpcError;

        await supabase.auth.signOut();
    };

    const resetPassword = async (email) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}`,
        });
        if (error) throw error;
    };

    return { user, loading, signIn, signUp, signOut, resetPassword, deleteAccount };
}
