import { useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';

export function useBudget(userId) {
    const [budget, setBudget] = useState(null);
    const [allBudgets, setAllBudgets] = useState([]);

    const fetchBudget = useCallback(async () => {
        if (!userId) return;
        const now = new Date();
        try {
            const { data, error } = await supabase
                .from('budgets')
                .select('*')
                .eq('user_id', userId)
                .eq('month', now.getMonth() + 1)
                .eq('year', now.getFullYear())
                .single();

            if (data && !error) {
                setBudget(data);
            }
        } catch {
            // No budget set — that's ok
        }
    }, [userId]);

    const fetchAllBudgets = useCallback(async () => {
        if (!userId) return;
        try {
            const { data, error } = await supabase
                .from('budgets')
                .select('*')
                .eq('user_id', userId)
                .order('year', { ascending: false })
                .order('month', { ascending: false });

            if (data && !error) {
                setAllBudgets(data);
            }
        } catch {
            // ignore
        }
    }, [userId]);

    const saveBudget = async (amount) => {
        const now = new Date();
        const budgetData = {
            month: now.getMonth() + 1,
            year: now.getFullYear(),
            amount: parseFloat(amount),
            currency: 'EUR',
            user_id: userId,
        };

        const { data, error } = await supabase
            .from('budgets')
            .upsert(budgetData, { onConflict: 'month,year,user_id' })
            .select()
            .single();

        if (error) throw error;
        setBudget(data);
        await fetchAllBudgets();
    };

    return { budget, allBudgets, fetchBudget, fetchAllBudgets, saveBudget };
}
