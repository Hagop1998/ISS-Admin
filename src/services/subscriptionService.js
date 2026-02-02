const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const API_BASE_PATH = process.env.REACT_APP_API_BASE_PATH || '/api';

const getAuthToken = () => {
    return localStorage.getItem('iss_admin_token');
};

const getHeaders = () => {
    const token = getAuthToken();
    return {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
    };
};

const SUBSCRIPTION_PLANS = {
    Basic: {
        name: 'Basic',
        description: 'Base plan - 800 AMD',
        price: 800,
    },
    'Basic + Camera': {
        name: 'Basic + Camera',
        description: 'Basic 800 AMD + camera 200 AMD = 1000 AMD',
        price: 1000,
    },
    'Basic + Barrier': {
        name: 'Basic + Barrier',
        description: 'Basic 800 AMD + barrier 200 AMD = 1000 AMD',
        price: 1000,
    },
    'Basic + Camera + Barrier': {
        name: 'Basic + Camera + Barrier',
        description: 'Basic 800 AMD + camera 200 AMD + barrier 200 AMD = 1200 AMD',
        price: 1200,
    },
    'Family & Friends': {
        name: 'Family & Friends',
        description: 'Family and friends - 0 AMD. All features for free.',
        price: 0,
    },
};

export const subscriptionService = {
    async getSubscriptionPlans(params = {}) {
        const { page = 1, limit = 50 } = params;
        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });
        const url = `${API_BASE_PATH}/subscriptions?${queryParams}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: getHeaders(),
            credentials: 'include',
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Unauthorized. Please login again.');
            }
            let errorMessage = 'Failed to fetch subscription plans';
            try {
                const errorData = await response.json();
                errorMessage = errorData?.message || errorData?.error || errorMessage;
            } catch (error) {
            }
            throw new Error(errorMessage);
        }

        return response.json();
    },

    async getSubscriptionPlanById(id) {
        const url = `${API_BASE_PATH}/subscriptions/${id}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: getHeaders(),
            credentials: 'include',
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Unauthorized. Please login again.');
            }
            if (response.status === 404) {
                throw new Error('Subscription plan not found');
            }
            let errorMessage = 'Failed to fetch subscription plan';
            try {
                const errorData = await response.json();
                errorMessage = errorData?.message || errorData?.error || errorMessage;
            } catch (error) {
            }
            throw new Error(errorMessage);
        }

        return response.json();
    },

    async createSubscriptionPlan(planData) {
        const url = `${API_BASE_PATH}/subscriptions`;

        const response = await fetch(url, {
            method: 'POST',
            headers: getHeaders(),
            credentials: 'include',
            body: JSON.stringify(planData),
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Unauthorized. Please login again.');
            }
            let errorMessage = 'Failed to create subscription plan';
            try {
                const errorData = await response.json();
                errorMessage = errorData?.message || errorData?.error || errorMessage;
            } catch (error) {
            }
            throw new Error(errorMessage);
        }

        return response.json();
    },

    getPlanPresets() {
        return SUBSCRIPTION_PLANS;
    },

    async createUserSubscription(subscriptionData) {
        const url = `${API_BASE_PATH}/subscriptions/user-subscriptions`;

        const response = await fetch(url, {
            method: 'POST',
            headers: getHeaders(),
            credentials: 'include',
            body: JSON.stringify(subscriptionData),
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Unauthorized. Please login again.');
            }
            let errorMessage = 'Failed to create user subscription';
            try {
                const errorData = await response.json();
                errorMessage = errorData?.message || errorData?.error || errorMessage;
            } catch (error) {
                console.log(error);
            }
            throw new Error(errorMessage);
        }

        return response.json();
    },

    async updateUserSubscription(id, subscriptionData) {
        const url = `${API_BASE_PATH}/subscriptions/user-subscriptions/${id}`;

        const response = await fetch(url, {
            method: 'PATCH',
            headers: getHeaders(),
            credentials: 'include',
            body: JSON.stringify(subscriptionData),
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Unauthorized. Please login again.');
            }
            let errorMessage = 'Failed to update user subscription';
            try {
                const errorData = await response.json();
                errorMessage = errorData?.message || errorData?.error || errorMessage;
            } catch (error) {
            }
            throw new Error(errorMessage);
        }

        return response.json();
    },
};

