
export interface AdminUser {
    id: string;
    email: string;
    name: string | null;
    avatar_url: string | null;
    created_at: string;
    isPremium: boolean;
    subscription?: {
        status: string;
        current_period_end: string;
        plan_type: string;
    };
}
