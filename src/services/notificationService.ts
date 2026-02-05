 import { RenewalRecord, RenewalStage } from '@/types/renewal';
 import { toast } from 'sonner';
 import { v4 as uuidv4 } from 'uuid';
 
 export type NotificationType = 
   | 'red_risk_alert'
   | 'owner_acknowledged'
   | 'owner_rejected'
   | 'owner_changes_requested'
   | 'agreement_signed'
   | 'stage_advancement';
 
 export interface Notification {
   id: string;
   type: NotificationType;
   title: string;
   message: string;
   propertyId: string;
   propertyName: string;
   renewalId: string;
   timestamp: string;
   isRead: boolean;
   priority: 'high' | 'medium' | 'low';
   emailSent?: boolean;
   emailSentAt?: string;
 }
 
 // Simulated notification store (in production, this would be backend)
 let notifications: Notification[] = [];
 
 // Email simulation function
 async function simulateSendEmail(
   to: string,
   subject: string,
   body: string
 ): Promise<{ success: boolean; messageId: string }> {
   // Simulate API delay
   await new Promise(resolve => setTimeout(resolve, 500));
   
   console.log('📧 Email Sent:', { to, subject, body });
   
   return {
     success: true,
     messageId: `email-${uuidv4().slice(0, 8)}`,
   };
 }
 
 // Get PM email (simulated)
 function getPMEmail(pmName: string): string {
   const emailName = pmName.toLowerCase().replace(' ', '.');
   return `${emailName}@company.com`;
 }
 
 // Create and send red risk notification
 export async function notifyRedRisk(renewal: RenewalRecord): Promise<Notification> {
   const notification: Notification = {
     id: uuidv4(),
     type: 'red_risk_alert',
     title: '🔴 Critical: Renewal at Red Risk',
     message: `${renewal.property.propertyName} has only ${renewal.lease.daysToExpiry} days left. Immediate action required to prevent forced move-out.`,
     propertyId: renewal.property.propertyId,
     propertyName: renewal.property.propertyName,
     renewalId: renewal.id,
     timestamp: new Date().toISOString(),
     isRead: false,
     priority: 'high',
   };
   
   notifications.unshift(notification);
   
   // Show toast notification
   toast.error(notification.title, {
     description: notification.message,
     duration: 8000,
   });
   
   // Simulate sending email
   const pmEmail = getPMEmail(renewal.property.assignedPM);
   const emailResult = await simulateSendEmail(
     pmEmail,
     `⚠️ URGENT: Renewal at Risk - ${renewal.property.propertyName}`,
     `
 Dear ${renewal.property.assignedPM},
 
 CRITICAL RENEWAL ALERT
 
 Property: ${renewal.property.propertyName} (${renewal.property.propertyId})
 Days Remaining: ${renewal.lease.daysToExpiry}
 Risk Level: RED
 Current Stage: ${renewal.status.currentStage}
 
 This renewal requires immediate attention. Failure to act may result in:
 - Forced move-out
 - Score penalty of -15 points
 - Impact on incentive eligibility
 
 Please log into the Renewal Tracker and take action immediately.
 
 Regards,
 PM Productivity System
     `.trim()
   );
   
   if (emailResult.success) {
     notification.emailSent = true;
     notification.emailSentAt = new Date().toISOString();
     
     toast.info('📧 Email notification sent', {
       description: `Alert sent to ${pmEmail}`,
       duration: 3000,
     });
   }
   
   return notification;
 }
 
 // Create and send owner acknowledgement notification
 export async function notifyOwnerAcknowledgement(
   renewal: RenewalRecord,
   status: 'accepted' | 'rejected' | 'changes_requested'
 ): Promise<Notification> {
   const typeMap = {
     accepted: 'owner_acknowledged' as NotificationType,
     rejected: 'owner_rejected' as NotificationType,
     changes_requested: 'owner_changes_requested' as NotificationType,
   };
   
   const titleMap = {
     accepted: '✅ Owner Accepted Renewal',
     rejected: '❌ Owner Rejected Renewal',
     changes_requested: '📝 Owner Requested Changes',
   };
   
   const messageMap = {
     accepted: `Owner has accepted the renewal proposal for ${renewal.property.propertyName}. You can now proceed with sending the agreement.`,
     rejected: `Owner has rejected the renewal proposal for ${renewal.property.propertyName}. Contact owner to discuss alternatives.`,
     changes_requested: `Owner has requested changes to the renewal proposal for ${renewal.property.propertyName}. Review and respond.`,
   };
   
   const notification: Notification = {
     id: uuidv4(),
     type: typeMap[status],
     title: titleMap[status],
     message: messageMap[status],
     propertyId: renewal.property.propertyId,
     propertyName: renewal.property.propertyName,
     renewalId: renewal.id,
     timestamp: new Date().toISOString(),
     isRead: false,
     priority: status === 'rejected' ? 'high' : 'medium',
   };
   
   notifications.unshift(notification);
   
   // Show toast notification
   const toastFn = status === 'accepted' ? toast.success : status === 'rejected' ? toast.error : toast.warning;
   toastFn(notification.title, {
     description: notification.message,
     duration: 6000,
   });
   
   // Simulate sending email
   const pmEmail = getPMEmail(renewal.property.assignedPM);
   const emailResult = await simulateSendEmail(
     pmEmail,
     `Owner Response: ${renewal.property.propertyName} - ${status.replace('_', ' ').toUpperCase()}`,
     `
 Dear ${renewal.property.assignedPM},
 
 OWNER ACKNOWLEDGEMENT UPDATE
 
 Property: ${renewal.property.propertyName} (${renewal.property.propertyId})
 Owner Response: ${status.replace('_', ' ').toUpperCase()}
 
 ${messageMap[status]}
 
 ${status === 'accepted' ? 'Next Step: Send the renewal agreement for signature.' : ''}
 ${status === 'rejected' ? 'Next Step: Contact owner to understand concerns and negotiate.' : ''}
 ${status === 'changes_requested' ? 'Next Step: Review owner feedback and revise proposal.' : ''}
 
 Regards,
 PM Productivity System
     `.trim()
   );
   
   if (emailResult.success) {
     notification.emailSent = true;
     notification.emailSentAt = new Date().toISOString();
     
     toast.info('📧 Email notification sent', {
       description: `Update sent to ${pmEmail}`,
       duration: 3000,
     });
   }
   
   return notification;
 }
 
 // Notify on stage advancement
 export async function notifyStageAdvancement(
   renewal: RenewalRecord,
   fromStage: RenewalStage,
   toStage: RenewalStage
 ): Promise<Notification> {
   const notification: Notification = {
     id: uuidv4(),
     type: 'stage_advancement',
     title: '📈 Renewal Stage Updated',
     message: `${renewal.property.propertyName} moved from "${fromStage.replace(/_/g, ' ')}" to "${toStage.replace(/_/g, ' ')}".`,
     propertyId: renewal.property.propertyId,
     propertyName: renewal.property.propertyName,
     renewalId: renewal.id,
     timestamp: new Date().toISOString(),
     isRead: false,
     priority: 'low',
   };
   
   notifications.unshift(notification);
   
   return notification;
 }
 
 // Check and notify renewals at red risk
 export function checkAndNotifyRedRiskRenewals(renewals: RenewalRecord[]): void {
   const redRiskRenewals = renewals.filter(r => 
     r.status.riskLevel === 'red' && 
     r.status.currentStage !== 'renewal_completed' &&
     r.status.currentStage !== 'renewal_failed'
   );
   
   // For demo purposes, we'll just log - in production, this would run on schedule
   if (redRiskRenewals.length > 0) {
     console.log(`🔴 ${redRiskRenewals.length} renewals at red risk require attention`);
   }
 }
 
 // Get all notifications
 export function getNotifications(): Notification[] {
   return notifications;
 }
 
 // Get unread count
 export function getUnreadCount(): number {
   return notifications.filter(n => !n.isRead).length;
 }
 
 // Mark notification as read
 export function markAsRead(notificationId: string): void {
   const notification = notifications.find(n => n.id === notificationId);
   if (notification) {
     notification.isRead = true;
   }
 }
 
 // Mark all as read
 export function markAllAsRead(): void {
   notifications.forEach(n => n.isRead = true);
 }
 
 // Clear notifications
 export function clearNotifications(): void {
   notifications = [];
 }