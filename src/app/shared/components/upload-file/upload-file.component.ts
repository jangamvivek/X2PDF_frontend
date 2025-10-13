import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from '../../../services/app.service';
import { DataPersistenceService, ChatSession } from '../../../services/data-persistence.service';
import { 
  EnhancedVisualizationData, 
  FileUploadResponse, 
  VisualizationRecommendation,
  DistributionData,
  CategoricalData,
  TimeSeriesData,
  BoxPlotData,
  OutlierAnalysis,
  SummaryResponse
} from '../../../models/data.interface';
import { environment } from '../../../../environments/environment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-upload-file',
  standalone: false,
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.css']
})
export class UploadFileComponent implements OnInit, OnDestroy {

  selectedFileName: string = '';
  selectedFile: File | null = null;
  urlInput: string = '';
  selectedImageName: string = '';
  selectedImage: File | null = null;
  
  // New properties for summary functionality
  uploadedFileData: FileUploadResponse | null = null;
  generatedSummary: string = '';
  isGeneratingSummary: boolean = false;
  showSummary: boolean = false;
  typingText: string = '';
  private typingInterval: any;

  // Data persistence properties
  private currentSession: ChatSession | null = null;
  private sessionSubscription: Subscription = new Subscription();

  constructor(
    private http: HttpClient, 
    private appService: AppService,
    private router: Router,
    private dataPersistenceService: DataPersistenceService
  ) {}

  ngOnInit(){
    this.initializeSession();
    this.subscribeToSessionChanges();
  }

  ngOnDestroy() {
    this.sessionSubscription.unsubscribe();
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
    }
  }

  private initializeSession() {
    // Get or create current session
    this.currentSession = this.dataPersistenceService.getCurrentSession();
    if (!this.currentSession) {
      this.currentSession = this.dataPersistenceService.createNewSession();
    }

    // Restore data from session if available
    if (this.currentSession.uploadData) {
      this.restoreSessionData();
    }
  }

  private subscribeToSessionChanges() {
    this.sessionSubscription = this.dataPersistenceService.currentSession$.subscribe(session => {
      this.currentSession = session;
      if (!session) {
        this.clearComponentData();
        return;
      }

      // If switched to a freshly created session (no data yet), reset UI to empty state
      if (!session.uploadData && !session.summary) {
        this.clearComponentData();
        return;
      }

      // Otherwise restore whatever data the session holds
      this.restoreSessionData();
    });
  }

  private restoreSessionData() {
    if (this.currentSession?.uploadData) {
      this.uploadedFileData = this.currentSession.uploadData;
      this.selectedFileName = this.currentSession.uploadData.filename;
      this.appService.setUploadData(this.currentSession.uploadData);
      
      // Restore summary if available
      if (this.currentSession.summary) {
        this.generatedSummary = this.currentSession.summary;
        this.showSummary = true;
      }
    }
  }

  private clearComponentData() {
    this.selectedFileName = '';
    this.selectedFile = null;
    this.urlInput = '';
    this.selectedImageName = '';
    this.selectedImage = null;
    this.uploadedFileData = null;
    this.generatedSummary = '';
    this.isGeneratingSummary = false;
    this.showSummary = false;
  }

  isLoading = false;
  progressValue = 0;
  handleFileUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      console.warn('No file selected');
      return;
    }

    const file = input.files[0];
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];

    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();
    const isValidType =
      allowedTypes.includes(fileType) ||
      fileName.endsWith('.csv') ||
      fileName.endsWith('.xls') ||
      fileName.endsWith('.xlsx');

    if (!isValidType) {
      alert('Only Excel or CSV files are allowed.');
      return;
    }

    this.selectedFileName = file.name;
    this.selectedFile = file;
  }
  

  uploadFileToBackend(file: File): void {
    this.isLoading = true;
    this.progressValue = 0;
    const formData = new FormData();
    formData.append('file', file);
  
    this.http.post<FileUploadResponse>(`${environment.apiUrl}upload`, formData, {
      reportProgress: true,
      observe: 'events'
    }).subscribe({
      next: (event: HttpEvent<FileUploadResponse>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            if (event.total) {
              this.progressValue = Math.round((event.loaded / event.total) * 100);
              console.log(`Upload progress: ${this.progressValue}%`);
            }
            break;
          case HttpEventType.Response:
            console.log('✅ File uploaded successfully:', event.body);
            this.appService.setUploadData(event.body!);
            this.uploadedFileData = event.body!;
            this.isLoading = false;
            this.progressValue = 100;
            
            // Save upload data to current session
            this.dataPersistenceService.updateUploadData(event.body!);
            
            // Check if user has entered a prompt for summary generation
            if (this.urlInput.trim()) {
              this.generateSummaryFromPrompt(this.urlInput.trim());
            } else {
              // Navigate to UUID-based dashboard route
              if (event.body?.dashboard_uuid) {
                this.router.navigate(['/dashboard-', event.body.dashboard_uuid]);
              } else {
                this.router.navigate(['/dashboard']);
              }
            }
            break;
        }
      },
      error: (error) => {
        console.error('❌ Upload failed:', error);
        alert('Failed to upload file.');
        this.isLoading = false;
        this.progressValue = 0;
      }
    });
  }
  
  uploadImageToBackend(image: File): void {
    this.isLoading = true;
    this.progressValue = 0;
    const formData = new FormData();
    formData.append('file', image);
  
    this.http.post(`${environment.apiUrl}upload-image`, formData, {
      reportProgress: true,
      observe: 'events'
    }).subscribe({
      next: (event: HttpEvent<any>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            if (event.total) {
              this.progressValue = Math.round((event.loaded / event.total) * 100);
              console.log(`Image upload progress: ${this.progressValue}%`);
            }
            break;
          case HttpEventType.Response:
            console.log('✅ Image uploaded:', event.body);
            alert('Image uploaded successfully!');
            this.isLoading = false;
            this.progressValue = 100;
            break;
        }
      },
      error: (err) => {
        console.error('❌ Image upload failed:', err);
        alert('Image upload failed!');
        this.isLoading = false;
        this.progressValue = 0;
      }
    });
  }
  
  // For URL scraping (since it's not a file upload, simulate progress)
  uploadUrlToBackend(): void {
    if (!this.urlInput || !this.isValidUrl(this.urlInput)) {
      alert('Please enter a valid URL.');
      return;
    }
    
    this.isLoading = true;
    this.progressValue = 0;
    
    // Simulate progress for URL scraping
    const progressInterval = setInterval(() => {
      if (this.progressValue < 90) {
        this.progressValue += 10;
      }
    }, 300);
  
    this.http.get(`${environment.apiUrl}scrape`, {
      params: { url: this.urlInput }
    }).subscribe({
      next: (response) => {
        clearInterval(progressInterval);
        this.progressValue = 100;
        console.log('✅ URL sent successfully:', response);
        alert('URL sent successfully!');
        this.urlInput = '';
        setTimeout(() => {
          this.isLoading = false;
          this.progressValue = 0;
        }, 500);
      },
      error: (error) => {
        clearInterval(progressInterval);
        console.error('❌ Sending URL failed:', error);
        alert('Failed to send URL.');
        this.isLoading = false;
        this.progressValue = 0;
      }
    });
  }
  

  // Basic URL validation helper
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }


  removeSelectedFile(): void {
    this.selectedFileName = '';
    this.selectedFile = null;
  }
  

  handleImageUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const image = input.files[0];
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    const imageType = image.type.toLowerCase();
    const imageName = image.name.toLowerCase();

    const isValidType =
      allowedTypes.includes(imageType) ||
      imageName.endsWith('.png') ||
      imageName.endsWith('.jpg') ||
      imageName.endsWith('.jpeg') ||
      imageName.endsWith('.webp');

    if (!isValidType) {
      alert('Only image files (PNG, JPG, JPEG, WEBP) are allowed.');
      return;
    }

    this.selectedImageName = image.name;
    this.selectedImage = image;
  }


  handleUpload(): void {
    if (this.selectedFile) {
      this.uploadFileToBackend(this.selectedFile);
    }

    if (this.selectedImage) {
      this.uploadImageToBackend(this.selectedImage);
    }

    if (!this.selectedFile && !this.selectedImage && this.urlInput.trim()) {
      this.uploadUrlToBackend();
    }

    if (!this.selectedFile && !this.selectedImage && !this.urlInput.trim()) {
      alert('Select a file/image or enter a URL.');
    }
  }

  // New method to generate summary from prompt
  generateSummaryFromPrompt(prompt: string): void {
    if (!this.uploadedFileData) {
      alert('Please upload a file first.');
      return;
    }

    this.isGeneratingSummary = true;
    this.generatedSummary = '';
    this.showSummary = true;
    this.stopTypingEffect();

    this.appService.generateSummary(prompt, this.uploadedFileData).subscribe({
      next: (response: SummaryResponse) => {
        console.log('✅ Summary generated successfully:', response);
        const cleaned = this.cleanAIResponseText(response.summary);
        this.generatedSummary = cleaned;
        this.isGeneratingSummary = false;
        
        // Start typing effect for the summary
        this.startTypingEffect(cleaned);
        
        // Save summary to current session
        this.dataPersistenceService.updateSummary(cleaned);
      },
      error: (error) => {
        console.error('❌ Summary generation failed:', error);
        this.generatedSummary = 'Sorry, I encountered an error while generating the summary. Please try again.';
        this.isGeneratingSummary = false;
        this.startTypingEffect(this.generatedSummary);
        alert('Failed to generate summary. Please try again.');
      }
    });
  }

  // Method to ask another question
  askAnotherQuestion(): void {
    this.showSummary = false;
    this.generatedSummary = '';
    this.urlInput = '';
  }

  // Method to go to dashboard
  goToDashboard(): void {
    if (this.uploadedFileData?.dashboard_uuid) {
      this.router.navigate(['/dashboard-', this.uploadedFileData.dashboard_uuid]);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  // Textarea handling methods
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.handleUpload();
    }
  }

  adjustTextareaHeight(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
  }

  // Typing effect methods
  startTypingEffect(text: string): void {
    this.typingText = '';
    let index = 0;
    
    this.typingInterval = setInterval(() => {
      if (index < text.length) {
        this.typingText += text[index];
        index++;
      } else {
        clearInterval(this.typingInterval);
        this.typingInterval = null;
      }
    }, 30); // Adjust speed as needed
  }

  stopTypingEffect(): void {
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
      this.typingInterval = null;
    }
  }

  // Cleans AI markdown-like responses by removing asterisks, table pipes and separators, and bold markers
  private cleanAIResponseText(text: string): string {
    if (!text) return '';

    const lines = text.split(/\r?\n/);
    const cleanedLines: string[] = [];

    for (let rawLine of lines) {
      let line = rawLine;

      // Skip markdown table separators like |-----|-----|
      if (/^\|?[\s:.-]+\|[\s:.-]+\|?\s*$/.test(line)) {
        continue;
      }

      // Remove full table rows like | a | b |
      if (/^\s*\|.+\|\s*$/.test(line)) {
        line = line.replace(/^\s*\|\s*/, '').replace(/\s*\|\s*$/,'');
        line = line.replace(/\s*\|\s*/g, ' — ');
      }

      // Strip leading list markers of *, -, • while keeping the text
      line = line.replace(/^\s*([*\-•]+)\s+/, '');

      // Remove bold/italic markers **text** or *text*
      line = line.replace(/\*\*(.*?)\*\*/g, '$1');
      line = line.replace(/\*(.*?)\*/g, '$1');
      line = line.replace(/`([^`]*)`/g, '$1');

      // Collapse multiple spaces
      line = line.replace(/\s{2,}/g, ' ').trimEnd();

      cleanedLines.push(line);
    }

    // Remove extra blank lines
    const joined = cleanedLines
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return joined;
  }

  // uploadImageToBackend(image: File): void {
  //   this.isLoading = true;
  //   const formData = new FormData();
  //   formData.append('file', image); // FastAPI should accept 'file'

  //   this.http.post(`${environment.apiUrl}upload-image`, formData).subscribe({
  //     next: (res) => {
  //       console.log('✅ Image uploaded:', res);
  //       alert('Image uploaded successfully!');
  //       this.isLoading = false;
  //     },
  //     error: (err) => {
  //       console.error('❌ Image upload failed:', err);
  //       alert('Image upload failed!');
  //       this.isLoading = false;
  //     }
  //   });
  // }

  
}
