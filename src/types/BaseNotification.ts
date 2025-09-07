export interface BaseNotification {
  id: string;
  title: string;          
  body: string;           
  data?: Record<string, any>
  sound?: boolean;        
  vibrate?: boolean;      
  scheduledTime?: Date;   
  isTriggered?: boolean;  
};