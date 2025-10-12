import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { FileUploadResponse, SummaryResponse } from '../models/data.interface';

export interface ChatSession {
  id: string;
  title: string;
  filename: string;
  uploadData: FileUploadResponse | null;
  summary: string;
  timestamp: Date;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DataPersistenceService {
  private currentSessionSubject = new BehaviorSubject<ChatSession | null>(null);
  public currentSession$ = this.currentSessionSubject.asObservable();

  private sessionsSubject = new BehaviorSubject<ChatSession[]>([]);
  public sessions$ = this.sessionsSubject.asObservable();

  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      this.loadSessionsFromStorage();
    }
  }

  private loadSessionsFromStorage(): void {
    if (!this.isBrowser) return;
    
    const savedSessions = localStorage.getItem('chatSessions');
    if (savedSessions) {
      try {
        const sessions = JSON.parse(savedSessions).map((session: any) => ({
          ...session,
          timestamp: new Date(session.timestamp)
        }));
        this.sessionsSubject.next(sessions);
        
        // Restore active session if any
        const activeSession = sessions.find((s: ChatSession) => s.isActive);
        if (activeSession) {
          this.currentSessionSubject.next(activeSession);
        }
      } catch (error) {
        console.error('Error loading sessions from storage:', error);
        this.sessionsSubject.next([]);
      }
    }
  }

  private saveSessionsToStorage(): void {
    if (!this.isBrowser) return;
    
    localStorage.setItem('chatSessions', JSON.stringify(this.sessionsSubject.value));
  }

  createNewSession(): ChatSession {
    // Check if current session is empty before creating a new one
    const currentSession = this.currentSessionSubject.value;
    if (currentSession && this.isSessionEmpty(currentSession)) {
      // If current session is empty, just activate it instead of creating new one
      this.setActiveSession(currentSession.id);
      return currentSession;
    }

    const newSession: ChatSession = {
      id: this.generateSessionId(),
      title: 'New Chat',
      filename: '',
      uploadData: null,
      summary: '',
      timestamp: new Date(),
      isActive: true
    };

    // Deactivate all other sessions
    const sessions = this.sessionsSubject.value.map(session => ({
      ...session,
      isActive: false
    }));

    // Add new session
    sessions.unshift(newSession);
    
    // Keep only last 20 sessions
    if (sessions.length > 20) {
      sessions.splice(20);
    }

    this.sessionsSubject.next(sessions);
    this.currentSessionSubject.next(newSession);
    this.saveSessionsToStorage();

    return newSession;
  }

  private isSessionEmpty(session: ChatSession): boolean {
    return !session.uploadData && !session.summary;
  }

  setActiveSession(sessionId: string): void {
    const sessions = this.sessionsSubject.value.map(session => ({
      ...session,
      isActive: session.id === sessionId
    }));

    const activeSession = sessions.find(s => s.isActive);
    
    this.sessionsSubject.next(sessions);
    this.currentSessionSubject.next(activeSession || null);
    this.saveSessionsToStorage();
  }

  updateCurrentSession(updates: Partial<ChatSession>): void {
    const currentSession = this.currentSessionSubject.value;
    if (currentSession) {
      const updatedSession = { ...currentSession, ...updates };
      
      // Update in sessions list
      const sessions = this.sessionsSubject.value.map(session =>
        session.id === currentSession.id ? updatedSession : session
      );
      
      this.sessionsSubject.next(sessions);
      this.currentSessionSubject.next(updatedSession);
      this.saveSessionsToStorage();
    }
  }

  updateUploadData(uploadData: FileUploadResponse): void {
    const currentSession = this.currentSessionSubject.value;
    if (currentSession) {
      const updatedSession: ChatSession = {
        ...currentSession,
        uploadData,
        filename: uploadData.filename,
        title: this.generateSessionTitle(uploadData),
        timestamp: new Date()
      };

      this.updateCurrentSession(updatedSession);
    } else {
      // Create new session if none exists
      const newSession = this.createNewSession();
      this.updateUploadData(uploadData);
    }
  }

  updateSummary(summary: string): void {
    this.updateCurrentSession({ summary });
  }

  deleteSession(sessionId: string): void {
    const sessions = this.sessionsSubject.value.filter(s => s.id !== sessionId);
    this.sessionsSubject.next(sessions);
    
    // If deleted session was active, clear current session
    const currentSession = this.currentSessionSubject.value;
    if (currentSession && currentSession.id === sessionId) {
      this.currentSessionSubject.next(null);
    }
    
    this.saveSessionsToStorage();
  }

  clearAllSessions(): void {
    this.sessionsSubject.next([]);
    this.currentSessionSubject.next(null);
    if (this.isBrowser) {
      localStorage.removeItem('chatSessions');
    }
  }

  getCurrentSession(): ChatSession | null {
    return this.currentSessionSubject.value;
  }

  getSessions(): ChatSession[] {
    return this.sessionsSubject.value;
  }

  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private generateSessionTitle(uploadData: FileUploadResponse): string {
    const filename = uploadData.filename.replace(/\.[^/.]+$/, ""); // Remove extension
    const timestamp = new Date().toLocaleDateString();
    return `${filename} - ${timestamp}`;
  }

  // Method to restore session data when navigating back
  restoreSessionData(sessionId: string): void {
    const session = this.sessionsSubject.value.find(s => s.id === sessionId);
    if (session) {
      this.setActiveSession(sessionId);
    }
  }
}
