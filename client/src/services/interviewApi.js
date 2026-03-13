import axios from 'axios';

const INTERVIEW_API_BASE = import.meta.env.VITE_INTERVIEW_API_URL || 'http://localhost:5000/api';

const interviewApi = axios.create({
    baseURL: INTERVIEW_API_BASE,
    headers: { 'Content-Type': 'application/json' },
});

// Add auth token to every request
interviewApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('interview_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 errors
interviewApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('interview_token');
            localStorage.removeItem('interview_user');
        }
        return Promise.reject(error);
    }
);

// Auth
export const interviewAuthAPI = {
    register: (data) => interviewApi.post('/auth/register', data),
    login: (data) => interviewApi.post('/auth/login', data),
    sync: (data) => interviewApi.post('/auth/sync', data),
    getProfile: () => interviewApi.get('/auth/profile'),
    updateProfile: (data) => interviewApi.put('/auth/profile', data),
};

// Aptitude
export const aptitudeAPI = {
    start: (skill_level) => interviewApi.post('/aptitude/start', { skill_level }),
    submitAnswer: (data) => interviewApi.post('/aptitude/answer', data),
    complete: (session_id) => interviewApi.post('/aptitude/complete', { session_id }),
    trackTabSwitch: (session_id) => interviewApi.post('/aptitude/tab-switch', { session_id }),
};

// Coding
export const codingAPI = {
    start: (data) => interviewApi.post('/coding/start', data),
    submit: (data) => interviewApi.post('/coding/submit', data),
    runTests: (data) => interviewApi.post('/coding/run-tests', data),
    complete: (session_id) => interviewApi.post('/coding/complete', { session_id }),
};

// Sessions
export const sessionAPI = {
    getAll: () => interviewApi.get('/sessions'),
    getById: (id) => interviewApi.get(`/sessions/${id}`),
};

// Leaderboard
export const leaderboardAPI = {
    getAll: (limit) => interviewApi.get(`/leaderboard${limit ? `?limit=${limit}` : ''}`),
    getMyRank: () => interviewApi.get('/leaderboard/me'),
};

// Resume
export const resumeAPI = {
    evaluate: (data) => interviewApi.post('/resume/evaluate', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export default interviewApi;
