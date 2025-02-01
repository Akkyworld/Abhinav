import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock, MapPin, Package, Trash, AlertOctagon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface NotificationCardProps {
  id: string;
  title: string;
  description: string;
  location: string;
  urgency: "high" | "medium" | "low";
  timestamp: string;
  neededRelief?: string[];
  imageUrl?: string | null;
  onRespond: () => void;
  createdBy?: string;
}

export const NotificationCard = ({
  id,
  title,
  description,
  location,
  urgency,
  timestamp,
  neededRelief,
  imageUrl,
  onRespond,
  createdBy,
}: NotificationCardProps) => {
  const { toast } = useToast();
  
  const urgencyColor = {
    high: "bg-red-600 text-white font-bold",
    medium: "bg-blue-600 text-white font-bold",
    low: "bg-green-600 text-white font-bold",
  }[urgency];

  const handleDelete = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || user.id !== createdBy) {
        toast({
          title: "Permission Denied",
          description: "You can only delete alerts that you created.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('disaster_alerts')
        .update({ status: 'inactive' })
        .eq('id', id);

      if (error) throw error;

      await supabase
        .from('disaster_responses')
        .delete()
        .eq('alert_id', id);

      toast({
        title: "Alert Deleted",
        description: "The alert has been successfully removed.",
      });

      window.dispatchEvent(new CustomEvent('alert-deleted', { detail: id }));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the alert. Please try again.",
        variant: "destructive",
      });
    }
  };

  const parseReliefItem = (reliefString: string) => {
    try {
      const relief = JSON.parse(reliefString);
      return {
        item: relief.item,
        priority: relief.priority,
        quantity: relief.quantity
      };
    } catch {
      return { item: reliefString, priority: 'medium', quantity: 'Not specified' };
    }
  };

  return (
    <Card className="w-full animate-notification-in hover:shadow-xl transition-shadow duration-300 bg-white border-2 border-gray-200">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4 border-b border-gray-100">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <AlertOctagon className="h-8 w-8 text-red-600" />
            <CardTitle className="text-4xl font-bold tracking-tight text-gray-900">
              {title}
            </CardTitle>
          </div>
          <Badge className={`${urgencyColor} text-base font-bold px-4 py-1.5 shadow-sm`}>
            <AlertCircle className="mr-2 h-5 w-5" />
            {urgency.toUpperCase()} PRIORITY
          </Badge>
        </div>
        {createdBy && (
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:text-red-600 transition-colors"
            onClick={handleDelete}
          >
            <Trash className="h-6 w-6" />
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="space-y-8 pt-6">
        {imageUrl && (
          <div className="relative h-80 w-full overflow-hidden rounded-xl border-2 border-gray-100">
            <img
              src={imageUrl}
              alt={title}
              className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        
        <div className="space-y-6">
          <p className="text-2xl leading-relaxed text-gray-800 font-medium">
            {description}
          </p>
          
          <div className="flex flex-col space-y-3 text-lg text-gray-700">
            <div className="flex items-center">
              <Clock className="mr-3 h-6 w-6 text-blue-600" />
              <span className="font-medium">{timestamp}</span>
            </div>
            
            <div className="flex items-center">
              <MapPin className="mr-3 h-6 w-6 text-blue-600" />
              <span className="font-medium">{location}</span>
            </div>
          </div>
        </div>

        {neededRelief && neededRelief.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200 shadow-inner">
            <div className="flex items-center text-xl font-bold text-gray-900 mb-4">
              <Package className="mr-3 h-6 w-6 text-blue-600" />
              <span>Relief Needs</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {neededRelief.map((item, index) => {
                const reliefItem = parseReliefItem(item);
                const priorityColors = {
                  high: "bg-red-50 text-red-700 border-red-200",
                  medium: "bg-blue-50 text-blue-700 border-blue-200",
                  low: "bg-green-50 text-green-700 border-green-200"
                };
                const priorityColor = priorityColors[reliefItem.priority];

                return (
                  <div 
                    key={index}
                    className={`p-4 rounded-lg border-2 ${priorityColor} flex flex-col gap-2`}
                  >
                    <div className="font-bold text-lg">{reliefItem.item}</div>
                    <div className="text-base">
                      Quantity: {reliefItem.quantity}
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`w-fit mt-1 ${priorityColor} font-semibold`}
                    >
                      {reliefItem.priority.toUpperCase()} Priority
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-4">
        <Button 
          onClick={onRespond} 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold py-8 rounded-lg shadow-lg hover:shadow-xl transition-all"
        >
          Respond & Support
        </Button>
      </CardFooter>
    </Card>
  );
};