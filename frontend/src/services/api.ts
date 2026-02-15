import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// ============ Interfaces ============

export interface User {
    id: string;
    email: string;
    username: string;
    is_superuser: boolean;
    created_at: string;
}

export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export type ScheduleType = 'cron' | 'interval' | 'once';
export type TaskExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'timeout' | 'cancelled';

export interface Task {
    id: string;
    name: string;
    description: string | null;
    command: string;
    schedule_type: ScheduleType;
    schedule: string;
    timezone: string;
    timeout: number;
    max_retries: number;
    priority: number;
    metadata_info: Record<string, unknown> | null;
    dependencies: string[] | null;
    status: TaskStatus;
    is_active: boolean;
    last_run: string | null;
    next_run: string | null;
    created_at: string;
    updated_at: string;
    owner_id: string;
    owner_username: string | null;
}

export interface TaskExecution {
    id: string;
    task_id: string;
    status: TaskExecutionStatus;
    output: string | null;
    error: string | null;
    started_at: string;
    completed_at: string | null;
    retries: number;
}

export type NotificationChannel = 'email' | 'sms' | 'webhook';

export interface NotificationConfig {
    id: string;
    channel: NotificationChannel;
    enabled: boolean;
    on_success: boolean;
    on_failure: boolean;
    on_start: boolean;
    config: Record<string, string>;
    task_id: string | null;
    user_id: string;
    created_at: string;
    updated_at: string;
}

export interface NotificationConfigCreate {
    channel: NotificationChannel;
    enabled?: boolean;
    on_success?: boolean;
    on_failure?: boolean;
    on_start?: boolean;
    config: Record<string, string>;
    task_id?: string;
}

export interface NotificationLog {
    id: string;
    channel: NotificationChannel;
    recipient: string;
    status: 'sent' | 'failed' | 'pending';
    message: string;
    error: string | null;
    created_at: string;
}

export interface HealthCheck {
    status: string;
    database: string;
    scheduler: string;
    executor: string;
    version: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    username: string;
    password: string;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
    user: User;
}

// ============ Axios Setup ============

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ============ Auth API ============

export const authApi = {
    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const formData = new URLSearchParams();
        formData.append('username', data.email);
        formData.append('password', data.password);
        const response = await api.post('/auth/login', formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        localStorage.setItem('token', response.data.access_token);
        const userResponse = await api.get('/auth/me');
        return {
            ...response.data,
            user: userResponse.data,
        };
    },
    register: async (data: RegisterRequest): Promise<AuthResponse> => {
        const response = await api.post('/auth/register', data);
        return response.data;
    },
    getCurrentUser: async (): Promise<User> => {
        const response = await api.get('/auth/me');
        return response.data;
    },
};

// ============ Tasks API ============

export const tasksApi = {
    // List tasks
    getTasks: async (params?: { status?: string; page?: number; page_size?: number }): Promise<{ items: Task[]; total: number; page: number; page_size: number }> => {
        const response = await api.get('/tasks', { params });
        return response.data;
    },

    // Get single task
    getTask: async (id: string): Promise<Task> => {
        const response = await api.get(`/tasks/${id}`);
        return response.data;
    },

    // Create task
    createTask: async (data: Partial<Task>): Promise<Task> => {
        const response = await api.post('/tasks', data);
        return response.data;
    },

    // Update task
    updateTask: async (id: string, data: Partial<Task>): Promise<Task> => {
        const response = await api.put(`/tasks/${id}`, data);
        return response.data;
    },

    // Delete task
    deleteTask: async (id: string): Promise<void> => {
        await api.delete(`/tasks/${id}`);
    },

    // Execute task manually
    executeTask: async (id: string): Promise<{ execution_id: string; message: string }> => {
        const response = await api.post(`/tasks/${id}/execute`);
        return response.data;
    },

    // Pause task
    pauseTask: async (id: string): Promise<{ message: string }> => {
        const response = await api.post(`/tasks/${id}/pause`);
        return response.data;
    },

    // Resume task
    resumeTask: async (id: string): Promise<{ message: string }> => {
        const response = await api.post(`/tasks/${id}/resume`);
        return response.data;
    },

    // Get task executions
    getTaskExecutions: async (id: string): Promise<{ items: TaskExecution[]; total: number }> => {
        const response = await api.get(`/tasks/${id}/executions`);
        return response.data;
    },

    // Get single execution
    getTaskExecution: async (taskId: string, executionId: string): Promise<TaskExecution> => {
        const response = await api.get(`/tasks/${taskId}/executions/${executionId}`);
        return response.data;
    },

    // Get task dependencies
    getTaskDependencies: async (id: string): Promise<{ dependencies: string[] }> => {
        const response = await api.get(`/tasks/${id}/dependencies`);
        return response.data;
    },

    // Trigger task via webhook
    webhookTriggerTask: async (id: string): Promise<{ message: string }> => {
        const response = await api.post(`/tasks/webhook/trigger/${id}`);
        return response.data;
    },
};

// ============ Notifications API ============

export const notificationsApi = {
    // Create notification config
    createConfig: async (data: NotificationConfigCreate): Promise<NotificationConfig> => {
        const response = await api.post('/notifications/configs', data);
        return response.data;
    },

    // List all notification configs (optionally filtered by task_id)
    getConfigs: async (taskId?: string): Promise<NotificationConfig[]> => {
        const params = taskId ? { task_id: taskId } : {};
        const response = await api.get('/notifications/configs', { params });
        return response.data;
    },

    // Get single notification config
    getConfig: async (id: string): Promise<NotificationConfig> => {
        const response = await api.get(`/notifications/configs/${id}`);
        return response.data;
    },

    // Delete notification config
    deleteConfig: async (id: string): Promise<void> => {
        await api.delete(`/notifications/configs/${id}`);
    },

    // Update notification config
    updateConfig: async (id: string, data: {
        channel: NotificationChannel;
        config: Record<string, string>;
        enabled: boolean;
        on_success: boolean;
        on_failure: boolean;
        on_start: boolean;
        task_id?: string;
    }): Promise<NotificationConfig> => {
        const response = await api.put(`/notifications/configs/${id}`, data);
        return response.data;
    },

    // Get notification logs
    getLogs: async (params?: { limit?: number }): Promise<NotificationLog[]> => {
        const response = await api.get('/notifications/logs', { params });
        return response.data;
    },

    // Test notification
    testNotification: async (channel: string, recipient: string): Promise<{ success: boolean; message: string }> => {
        const response = await api.post(`/notifications/test/${channel}?recipient=${encodeURIComponent(recipient)}`);
        return { success: response.data.success, message: response.data.error || 'Test sent successfully' };
    },
};

// ============ Users API ============

export const usersApi = {
    // List users
    getUsers: async (): Promise<User[]> => {
        const response = await api.get('/users');
        return response.data;
    },

    // Get single user
    getUser: async (id: string): Promise<User> => {
        const response = await api.get(`/users/${id}`);
        return response.data;
    },

    // Create user (superuser only)
    createUser: async (data: {
        email: string;
        username: string;
        password: string;
        is_superuser?: boolean;
    }): Promise<User> => {
        const response = await api.post('/users', data);
        return response.data;
    },

    // Delete user
    deleteUser: async (id: string): Promise<void> => {
        await api.delete(`/users/${id}`);
    },
};

// ============ Health API ============

export const healthApi = {
    // Full health check
    getHealth: async (): Promise<HealthCheck> => {
        const response = await api.get('/health');
        return response.data;
    },

    // Readiness check
    getReady: async (): Promise<{ status: string }> => {
        const response = await api.get('/ready');
        return response.data;
    },

    // Liveness check
    getLive: async (): Promise<{ status: string }> => {
        const response = await api.get('/live');
        return response.data;
    },
};

export default api;
