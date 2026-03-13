import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth
export const authAPI = {
    register: (data: { email: string; name: string; password: string; skill_level?: string }) =>
        api.post('/auth/register', data),
    login: (data: { email: string; password: string }) =>
        api.post('/auth/login', data),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (data: any) => api.put('/auth/profile', data),
};

// Aptitude
export const aptitudeAPI = {
    start: (skill_level: string) => api.post('/aptitude/start', { skill_level }),
    submitAnswer: (data: { session_id: string; question_id: string; selected_answer: string; time_taken: number }) =>
        api.post('/aptitude/answer', data),
    complete: (session_id: string) => api.post('/aptitude/complete', { session_id }),
    trackTabSwitch: (session_id: string) => api.post('/aptitude/tab-switch', { session_id }),
};

// Coding
export const codingAPI = {
    start: (data: { preferred_language?: string; difficulty_preference?: string; aptitude_session_id?: string }) =>
        api.post('/coding/start', data),
    submit: (data: { session_id: string; problem_id: string; language: string; code: string }) =>
        api.post('/coding/submit', data),
    runTests: (data: { problem_id: string; language: string; code: string }) =>
        api.post('/coding/run-tests', data),
    complete: (session_id: string) => api.post('/coding/complete', { session_id }),
};

// Sessions
export const sessionAPI = {
    getAll: () => api.get('/sessions'),
    getById: (id: string) => api.get(`/sessions/${id}`),
};

// Leaderboard
export const leaderboardAPI = {
    getAll: (limit?: number) => api.get(`/leaderboard${limit ? `?limit=${limit}` : ''}`),
    getMyRank: () => api.get('/leaderboard/me'),
};

// Admin
export const adminAPI = {
    getDashboard: () => api.get('/admin/dashboard'),
    getCandidates: () => api.get('/admin/candidates'),
    getCandidateDetail: (id: string) => api.get(`/admin/candidates/${id}`),
    uploadAptitude: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/admin/upload/aptitude', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    uploadCoding: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/admin/upload/coding', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    exportResults: () => api.get('/admin/export/results', { responseType: 'blob' }),
    getAptitudeQuestions: () => api.get('/admin/questions/aptitude'),
    getCodingProblems: () => api.get('/admin/questions/coding'),
    deleteAptitudeQuestion: (id: string) => api.delete(`/admin/questions/aptitude/${id}`),
    deleteCodingProblem: (id: string) => api.delete(`/admin/questions/coding/${id}`),
};

// Resume
export const resumeAPI = {
    evaluate: (data: FormData) =>
        api.post('/resume/evaluate', data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
};

export default api;
