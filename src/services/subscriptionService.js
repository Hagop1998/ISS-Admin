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

export const subscriptionService = {
    async createUserSubscription(subscriptionData) {
        const url = process.env.NODE_ENV === 'development'
            ? `${API_BASE_PATH}/subscriptions/user-subscriptions`
            : `${API_BASE_URL}/subscriptions/user-subscriptions`;

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
        const url = process.env.NODE_ENV === 'development'
            ? `${API_BASE_PATH}/subscriptions/user-subscriptions/${id}`
            : `${API_BASE_URL}/subscriptions/user-subscriptions/${id}`;

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
                // Ignore JSON parse error
            }
            throw new Error(errorMessage);
        }

        return response.json();
    },
};

