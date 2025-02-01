import { useState, useEffect } from "react";
import { NotificationCard } from "@/components/NotificationCard";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

interface DisasterAlert {
  id: string;
  title: string;
  description: string;
  location: string;
  severity: "low" | "medium" | "high" | "critical";
  image_url: string | null;
  needed_relief: string[];
  created_at: string;
  created_by: string;
  status: string | null;
  additional_notes: string | null;
  contact_info: string | null;
}

const Alerts = () => {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<DisasterAlert[]>([]);
  const navigate = useNavigate();

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('disaster_alerts')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching alerts:', error);
        toast({
          title: "Error",
          description: "Failed to fetch alerts. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setAlerts(data || []);
    } catch (error) {
      console.error('Error in fetchAlerts:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchAlerts();
    
    const channel = supabase
      .channel('public:disaster_alerts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'disaster_alerts'
        },
        (payload: RealtimePostgresChangesPayload<DisasterAlert>) => {
          console.log('Real-time change received:', payload);
          
          if (!payload.eventType) return;

          switch (payload.eventType) {
            case 'DELETE':
            case 'UPDATE':
              if (payload.eventType === 'UPDATE' && payload.new?.status === 'active') {
                const updatedAlert = payload.new as DisasterAlert;
                setAlerts(prevAlerts => {
                  const index = prevAlerts.findIndex(alert => alert.id === updatedAlert.id);
                  if (index === -1) return [...prevAlerts, updatedAlert];
                  const newAlerts = [...prevAlerts];
                  newAlerts[index] = updatedAlert;
                  return newAlerts;
                });
              } else {
                const payloadId = (payload.old as DisasterAlert)?.id || (payload.new as DisasterAlert)?.id;
                if (payloadId) {
                  setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== payloadId));
                }
              }
              break;
            case 'INSERT':
              if (payload.new && payload.new.status === 'active') {
                const newAlert = payload.new as DisasterAlert;
                setAlerts(prevAlerts => [newAlert, ...prevAlerts]);
              }
              break;
          }
        }
      )
      .subscribe();

    const handleAlertDeleted = (event: CustomEvent<string>) => {
      setAlerts(prevAlerts => 
        prevAlerts.filter(alert => alert.id !== event.detail)
      );
    };

    window.addEventListener('alert-deleted', handleAlertDeleted as EventListener);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('alert-deleted', handleAlertDeleted as EventListener);
    };
  }, []);

  const handleRespond = async (alertId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const { error } = await supabase
        .from('disaster_responses')
        .insert({
          alert_id: alertId,
          responder_id: user.id,
          response_type: 'volunteer',
        });

      if (error) throw error;

      toast({
        title: "Response Registered",
        description: "धन्यवाद! Thank you for volunteering! A coordinator will contact you shortly.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to register response. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 mt-16">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Active Alerts</h2>
        <div className="space-y-4">
          {alerts.map((alert) => (
            <NotificationCard
              key={alert.id}
              id={alert.id}
              title={alert.title}
              description={alert.description}
              location={alert.location}
              urgency={alert.severity === 'critical' ? 'high' : alert.severity === 'high' ? 'medium' : 'low'}
              timestamp={new Date(alert.created_at).toLocaleString()}
              imageUrl={alert.image_url}
              neededRelief={alert.needed_relief}
              onRespond={() => handleRespond(alert.id)}
              createdBy={alert.created_by}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Alerts;