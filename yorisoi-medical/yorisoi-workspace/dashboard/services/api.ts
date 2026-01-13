
const API_BASE = 'http://localhost:8080';

export interface Job {
    jobId: string;
    mtime?: string;
    patientId?: string;
    patientName?: string;
    facilityId?: string;
    facilityName?: string;
}

export interface JobDetail {
    status: 'RUNNING' | 'DONE';
    transcript?: string;
    detailUrl?: string; // HTML URL
}

export const api = {
    fetchRecentJobs: async (): Promise<Job[]> => {
        try {
            const res = await fetch(`${API_BASE}/jobs`);
            if (!res.ok) throw new Error('Failed to fetch jobs');
            const json = await res.json();
            return json.jobs || [];
        } catch (e) {
            console.error('Fetch Jobs Error:', e);
            return [];
        }
    },

    fetchJob: async (jobId: string): Promise<JobDetail | null> => {
        try {
            const res = await fetch(`${API_BASE}/jobs/${jobId}`);
            if (!res.ok) throw new Error('Failed to fetch job detail');
            const json = await res.json();
            return json;
        } catch (e) {
            console.error('Fetch Job Error:', e);
            return null;
        }
    }
};
