import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface FAQ {
  question: string;
  answer: string;
}

@Component({
  selector: 'app-contact',
  standalone: false,
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent implements OnInit{
    contactForm: FormGroup;
    isSubmitting = false;
    showSuccess = false;

    faqs: FAQ[] = [
    {
      question: 'What file formats does X2PDF AI support?',
      answer: 'X2PDF AI supports a wide range of formats including Word documents (.docx, .doc), Excel spreadsheets (.xlsx, .xls), PowerPoint presentations (.pptx, .ppt), images (.jpg, .png, .gif), text files (.txt), and many more. Our AI technology ensures optimal conversion quality for all supported formats.'
    },
    {
      question: 'How secure is my data with X2PDF AI?',
      answer: 'Your data security is our top priority. All files are processed using enterprise-grade encryption, and we never store your documents on our servers after conversion. Files are automatically deleted within 24 hours, and all transfers use SSL encryption.'
    },
    {
      question: 'Is there a file size limit for conversions?',
      answer: 'Free users can convert files up to 10MB in size. Premium subscribers can convert files up to 100MB, while Enterprise customers have no file size restrictions. For larger files, please contact our support team.'
    },
    {
      question: 'How long does the conversion process take?',
      answer: 'Most conversions are completed within 30 seconds to 2 minutes, depending on the file size and complexity. Our AI technology is optimized for speed while maintaining high-quality output.'
    },
    {
      question: 'Can I convert multiple files at once?',
      answer: 'Yes! Premium and Enterprise users can batch convert up to 50 files simultaneously. This feature saves time and is perfect for businesses processing large volumes of documents.'
    },
    {
      question: 'Do you offer API access for developers?',
      answer: 'Absolutely! We provide comprehensive REST API access for developers who want to integrate X2PDF AI into their applications. Our API documentation includes code examples and SDKs for popular programming languages.'
    }
  ];

  constructor(private formBuilder: FormBuilder) {
    this.contactForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^[\+]?[1-9][\d]{0,15}$/)]],
      subject: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]],
      newsletter: [false]
    });
  }

  ngOnInit(): void {
    // Component initialization logic here
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      this.isSubmitting = true;
      
      // Simulate form submission
      this.simulateFormSubmission();
    } else {
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched();
    }
  }

  private simulateFormSubmission(): void {
    // In a real application, you would send the form data to your backend service
    const formData = this.contactForm.value;
    
    // Simulate API call delay
    setTimeout(() => {
      console.log('Form submitted successfully:', formData);
      
      // Reset form and show success message
      this.isSubmitting = false;
      this.showSuccess = true;
      this.contactForm.reset();
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        this.showSuccess = false;
      }, 5000);
      
      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
    }, 2000); // 2 second delay to simulate network request
  }

  private markFormGroupTouched(): void {
    Object.keys(this.contactForm.controls).forEach(key => {
      const control = this.contactForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  // Helper method to check if a field has a specific error
  hasError(fieldName: string, errorType: string): boolean {
    const field = this.contactForm.get(fieldName);
    return field ? field.hasError(errorType) && field.touched : false;
  }

  // Helper method to get error message for a field
  getErrorMessage(fieldName: string): string {
    const field = this.contactForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        return `${this.getFieldDisplayName(fieldName)} must be at least ${requiredLength} characters long`;
      }
      if (field.errors['pattern']) {
        return 'Please enter a valid phone number';
      }
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      firstName: 'First name',
      lastName: 'Last name',
      email: 'Email',
      phone: 'Phone number',
      subject: 'Subject',
      message: 'Message'
    };
    return displayNames[fieldName] || fieldName;
  }

  // Method to handle form reset
  resetForm(): void {
    this.contactForm.reset();
    this.showSuccess = false;
    this.isSubmitting = false;
  }

  // Method to handle newsletter subscription
  toggleNewsletter(): void {
    const currentValue = this.contactForm.get('newsletter')?.value;
    this.contactForm.patchValue({ newsletter: !currentValue });
  }

  // Method to validate phone number format
  private isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone);
  }

  // Method to format phone number display
  formatPhoneNumber(phone: string): string {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX for US numbers
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    
    return phone;
  }

  // Method to handle social media links
  openSocialLink(platform: string): void {
    const socialLinks: { [key: string]: string } = {
      twitter: 'https://twitter.com/x2pdf_ai',
      linkedin: 'https://linkedin.com/company/x2pdf-ai',
      github: 'https://github.com/x2pdf-ai',
      youtube: 'https://youtube.com/@x2pdf-ai'
    };

    if (socialLinks[platform]) {
      window.open(socialLinks[platform], '_blank', 'noopener,noreferrer');
    }
  }
}
