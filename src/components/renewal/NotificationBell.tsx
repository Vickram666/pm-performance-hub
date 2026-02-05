 import { useState, useEffect } from 'react';
 import { Bell } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Badge } from '@/components/ui/badge';
 import {
   Popover,
   PopoverContent,
   PopoverTrigger,
 } from '@/components/ui/popover';
 import { ScrollArea } from '@/components/ui/scroll-area';
 import { 
   getNotifications, 
   getUnreadCount, 
   markAsRead, 
   markAllAsRead,
   Notification 
 } from '@/services/notificationService';
 import { formatDistanceToNow, parseISO } from 'date-fns';
 
 interface NotificationBellProps {
   onNotificationClick?: (notification: Notification) => void;
 }
 
 export function NotificationBell({ onNotificationClick }: NotificationBellProps) {
   const [open, setOpen] = useState(false);
   const [notifications, setNotifications] = useState<Notification[]>([]);
   const [unreadCount, setUnreadCount] = useState(0);
 
   // Refresh notifications periodically
   useEffect(() => {
     const refresh = () => {
       setNotifications(getNotifications());
       setUnreadCount(getUnreadCount());
     };
     
     refresh();
     const interval = setInterval(refresh, 1000);
     return () => clearInterval(interval);
   }, []);
 
   const handleNotificationClick = (notification: Notification) => {
     markAsRead(notification.id);
     setUnreadCount(getUnreadCount());
     onNotificationClick?.(notification);
     setOpen(false);
   };
 
   const handleMarkAllRead = () => {
     markAllAsRead();
     setUnreadCount(0);
   };
 
   const getPriorityColor = (priority: Notification['priority']) => {
     switch (priority) {
       case 'high': return 'bg-red-500';
       case 'medium': return 'bg-amber-500';
       default: return 'bg-blue-500';
     }
   };
 
   return (
     <Popover open={open} onOpenChange={setOpen}>
       <PopoverTrigger asChild>
         <Button variant="ghost" size="icon" className="relative">
           <Bell className="h-5 w-5" />
           {unreadCount > 0 && (
             <Badge 
               className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs"
             >
               {unreadCount > 9 ? '9+' : unreadCount}
             </Badge>
           )}
         </Button>
       </PopoverTrigger>
       <PopoverContent className="w-96 p-0" align="end">
         <div className="flex items-center justify-between p-3 border-b">
           <h4 className="font-semibold">Notifications</h4>
           {unreadCount > 0 && (
             <Button 
               variant="ghost" 
               size="sm" 
               className="text-xs"
               onClick={handleMarkAllRead}
             >
               Mark all read
             </Button>
           )}
         </div>
         <ScrollArea className="h-80">
           {notifications.length === 0 ? (
             <div className="p-6 text-center text-muted-foreground">
               <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
               <p className="text-sm">No notifications yet</p>
             </div>
           ) : (
             <div className="divide-y">
               {notifications.slice(0, 20).map(notification => (
                 <button
                   key={notification.id}
                   onClick={() => handleNotificationClick(notification)}
                   className={`w-full p-3 text-left hover:bg-muted/50 transition-colors ${
                     !notification.isRead ? 'bg-primary/5' : ''
                   }`}
                 >
                   <div className="flex items-start gap-3">
                     <div className={`w-2 h-2 rounded-full mt-2 ${getPriorityColor(notification.priority)}`} />
                     <div className="flex-1 min-w-0">
                       <div className="flex items-center gap-2">
                         <span className="font-medium text-sm truncate">
                           {notification.title}
                         </span>
                         {!notification.isRead && (
                           <div className="w-2 h-2 rounded-full bg-primary" />
                         )}
                       </div>
                       <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                         {notification.message}
                       </p>
                       <div className="flex items-center gap-2 mt-1">
                         <span className="text-[10px] text-muted-foreground">
                           {formatDistanceToNow(parseISO(notification.timestamp), { addSuffix: true })}
                         </span>
                         {notification.emailSent && (
                           <Badge variant="outline" className="text-[10px] px-1 py-0">
                             📧 Email sent
                           </Badge>
                         )}
                       </div>
                     </div>
                   </div>
                 </button>
               ))}
             </div>
           )}
         </ScrollArea>
       </PopoverContent>
     </Popover>
   );
 }