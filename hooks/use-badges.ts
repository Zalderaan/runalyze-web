import { useState, useCallback, useEffect } from 'react';
import { BADGES } from '@/lib/badges.config';
import { HistoryItem } from './use-history';

export interface UserBadge {
    id: number;
    user_id: number;
    badge_id: string;
    earned_at: string;
}

export function useBadges() {
    const [earnedBadges, setEarnedBadges] = useState<UserBadge[]>([]);
    const [isLoadingBadges, setIsLoadingBadges] = useState(false);

    const fetchBadges = useCallback(async () => {
        setIsLoadingBadges(true);
        try {
            const response = await fetch('/api/badges');
            if (response.ok) {
                const data = await response.json();
                if (data.badges) {
                    setEarnedBadges(data.badges);
                }
            }
        } catch (error) {
            console.error("Failed to fetch badges", error);
        } finally {
            setIsLoadingBadges(false);
        }
    }, []);

    const awardBadge = async (badgeId: string) => {
        try {
            const response = await fetch('/api/badges', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ badge_id: badgeId })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.badge) {
                    setEarnedBadges(prev => [...prev, data.badge]);
                    return data.badge;
                }
            }
        } catch (error) {
            console.error("Failed to award badge", error);
        }
    };

    const evaluateAndAwardBadges = useCallback(async (history: HistoryItem[]) => {
        if (!history || history.length === 0) return;

        // Ensure we have the latest badges to avoid redundant awards
        // But since this is client side, we rely on the earnedBadges state
        const newlyEarned: string[] = [];

        for (const badgeDef of BADGES) {
            const alreadyEarned = earnedBadges.some(b => b.badge_id === badgeDef.id);
            if (!alreadyEarned) {
                const criteriaMet = badgeDef.evaluate(history);
                if (criteriaMet) {
                    console.log(`🎉 New badge unlocked: ${badgeDef.name}`);
                    await awardBadge(badgeDef.id);
                    newlyEarned.push(badgeDef.name);
                }
            }
        }

        return newlyEarned;
    }, [earnedBadges]);

    return {
        earnedBadges,
        fetchBadges,
        evaluateAndAwardBadges,
        isLoadingBadges
    };
}
