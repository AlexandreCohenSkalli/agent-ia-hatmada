// Types pour l'application
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface Campaign {
  id: string;
  userId: string;
  name: string;
  type: 'prospection' | 'coaching';
  description?: string;
  createdAt: Date;
}

export interface EmailRecord {
  id: string;
  userId: string;
  campaignId?: string;
  prospectName: string;
  prospectEmail: string;
  companyName: string;
  companyType: string;
  emailSubject: string;
  emailBody: string;
  emailPreview?: string;
  status: 'pending' | 'sent' | 'opened' | 'replied' | 'bounced';
  sentAt?: Date;
  repliedAt?: Date;
  replyContent?: string;
  openedCount: number;
  clickedCount: number;
  createdAt: Date;
}

export interface FileUpload {
  id: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  type: 'prospection' | 'coaching';
  uploadedAt: Date;
}

// Utility functions
export function getStatusColor(status: string): string {
  switch (status) {
    case 'pending':
      return 'yellow';
    case 'sent':
      return 'green';
    case 'opened':
      return 'blue';
    case 'replied':
      return 'purple';
    case 'bounced':
      return 'red';
    default:
      return 'gray';
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'pending':
      return 'En attente';
    case 'sent':
      return 'Envoyé';
    case 'opened':
      return 'Ouvert';
    case 'replied':
      return 'Réponse';
    case 'bounced':
      return 'Rebond';
    default:
      return status;
  }
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function truncateText(text: string, length: number = 100): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}
