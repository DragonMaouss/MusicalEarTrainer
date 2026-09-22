import type { SessionResult } from './types';

const STORAGE_KEY = 'musical-ear-trainer-session-results';

export function loadSessionResults(): SessionResult[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return [];
        }
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        console.error('Failed to load session results from localStorage', e);
        return [];
    }
}

export function saveSessionResult(session: SessionResult): void {
    try {
        const sessions = loadSessionResults();
        sessions.push(session);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
        console.error('Failed to save session result to localStorage', e);
    }
}
       