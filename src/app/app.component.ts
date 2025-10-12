import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { DataPersistenceService, ChatSession } from './services/data-persistence.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'Excel2PDFReports';
  showSidebar = false;

  constructor(
    private router: Router,
    private dataPersistenceService: DataPersistenceService
  ) {}

  ngOnInit() {
    // Show sidebar on upload page and hide on other pages
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.showSidebar = event.url.includes('/upload') || event.url === '/';
      });
  }

  onChatSelected(chat: ChatSession) {
    // Restore the selected chat session
    this.dataPersistenceService.restoreSessionData(chat.id);
  }

  onNewChatRequested() {
    // Create a new chat session
    this.dataPersistenceService.createNewSession();
  }
}
