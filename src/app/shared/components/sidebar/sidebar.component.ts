import { Component, OnInit, Output, EventEmitter, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from '../../../services/app.service';
import { DataPersistenceService, ChatSession } from '../../../services/data-persistence.service';
import { FileUploadResponse, SummaryResponse } from '../../../models/data.interface';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  standalone: false
})
export class SidebarComponent implements OnInit {
  @Output() chatSelected = new EventEmitter<ChatSession>();
  @Output() newChatRequested = new EventEmitter<void>();

  chatHistory: ChatSession[] = [];
  currentChatId: string | null = null;
  isMobileOpen = false;
  showProfileModal = false;
  showSettingsModal = false;
  activeSettingsTab = 'general';

  constructor(
    private router: Router,
    private appService: AppService,
    private dataPersistenceService: DataPersistenceService
  ) {}

  ngOnInit() {
    this.loadChatHistory();
    this.subscribeToSessions();
  }

  private loadChatHistory() {
    this.chatHistory = this.dataPersistenceService.getSessions();
  }

  private subscribeToSessions() {
    this.dataPersistenceService.sessions$.subscribe(sessions => {
      this.chatHistory = sessions;
    });
  }

  onNewChat() {
    this.currentChatId = null;
    this.newChatRequested.emit();
    this.router.navigate(['/upload']);
    this.closeMobileSidebar();
  }

  onChatSelect(chat: ChatSession) {
    this.currentChatId = chat.id;
    this.chatSelected.emit(chat);
    this.router.navigate(['/upload']);
    this.closeMobileSidebar();
  }

  toggleMobileSidebar() {
    this.isMobileOpen = !this.isMobileOpen;
  }

  closeMobileSidebar() {
    this.isMobileOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const sidebar = target.closest('.sidebar');
    const mobileToggle = target.closest('.mobile-toggle');
    
    if (this.isMobileOpen && !sidebar && !mobileToggle) {
      this.closeMobileSidebar();
    }
  }

  openProfileModal() {
    this.showProfileModal = true;
    this.closeMobileSidebar();
  }

  closeProfileModal() {
    this.showProfileModal = false;
  }

  openSettingsModal() {
    this.showSettingsModal = true;
    this.showProfileModal = false;
  }

  closeSettingsModal() {
    this.showSettingsModal = false;
  }

  setActiveSettingsTab(tab: string) {
    this.activeSettingsTab = tab;
  }

  onDeleteChat(chatId: string, event: Event) {
    event.stopPropagation();
    this.dataPersistenceService.deleteSession(chatId);
  }

  formatTimestamp(timestamp: Date): string {
    const now = new Date();
    const diffInHours = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return timestamp.toLocaleDateString();
    }
  }

  Logout(){
    this.router.navigate(['/login']);
  }
}
