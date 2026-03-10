import { useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';

export function useSubscriptions(userId) {
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSubscriptions = useCallback(async () => {
        if (!userId) {
            setLoading(false);
            return;
        }
        try {
            const { data, error } = await supabase
                .from('gaming_subscriptions')
                .select('*')
                .eq('user_id', userId)
                .order('next_renewal', { ascending: true });

            if (error) throw error;
            setSubscriptions(data || []);
        } catch (err) {
            console.error('Error fetching gaming subscriptions:', err);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const saveSubscription = async (subscription, editingId = null) => {
        if (editingId) {
            const { data, error } = await supabase
                .from('gaming_subscriptions')
                .update(subscription)
                .eq('id', editingId)
                .select()
                .single();

            if (error) throw error;
            setSubscriptions(prev => prev.map(s => s.id === editingId ? data : s));
        } else {
            const { data, error } = await supabase
                .from('gaming_subscriptions')
                .insert({ ...subscription, user_id: userId })
                .select()
                .single();

            if (error) throw error;
            setSubscriptions(prev => [data, ...prev]);
        }
    };

    const deleteSubscription = async (id) => {
        const { error } = await supabase
            .from('gaming_subscriptions')
            .delete()
            .eq('id', id);

        if (error) throw error;
        setSubscriptions(prev => prev.filter(s => s.id !== id));
    };

    return { subscriptions, loading, fetchSubscriptions, saveSubscription, deleteSubscription };
}
