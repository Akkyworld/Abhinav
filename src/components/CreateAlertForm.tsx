import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, MapPin, Package, Upload, Image } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateAlertFormData {
  title: string;
  description: string;
  location: {
    district: string;
    municipality: string;
    ward: string;
    specificLocation: string;
  };
  severity: "low" | "medium" | "high" | "critical";
  neededRelief: {
    item: string;
    priority: "high" | "medium" | "low";
    quantity?: string;
  }[];
  contactInfo: string;
  additionalNotes: string;
}

export const CreateAlertForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [reliefItems, setReliefItems] = useState<{
    item: string;
    priority: "high" | "medium" | "low";
    quantity?: string;
  }[]>([]);

  const form = useForm<CreateAlertFormData>({
    defaultValues: {
      title: "",
      description: "",
      location: {
        district: "",
        municipality: "",
        ward: "",
        specificLocation: "",
      },
      severity: "medium",
      neededRelief: [],
      contactInfo: "",
      additionalNotes: "",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const addReliefItem = () => {
    setReliefItems([...reliefItems, { item: "", priority: "medium" }]);
  };

  const updateReliefItem = (index: number, field: string, value: string) => {
    const updatedItems = [...reliefItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setReliefItems(updatedItems);
    form.setValue("neededRelief", updatedItems);
  };

  const removeReliefItem = (index: number) => {
    const updatedItems = reliefItems.filter((_, i) => i !== index);
    setReliefItems(updatedItems);
    form.setValue("neededRelief", updatedItems);
  };

  const onSubmit = async (data: CreateAlertFormData) => {
    try {
      setIsSubmitting(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to create an alert.",
          variant: "destructive",
        });
        return;
      }

      let imageUrl = null;

      if (selectedImage) {
        const fileExt = selectedImage.name.split('.').pop();
        const filePath = `${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('disaster-images')
          .upload(filePath, selectedImage);

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('disaster-images')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      const formattedLocation = `${data.location.district}, ${data.location.municipality}, Ward ${data.location.ward}, ${data.location.specificLocation}`;

      // Convert relief items to stringified format for database
      const formattedReliefItems = reliefItems.map(item => 
        JSON.stringify({
          item: item.item,
          priority: item.priority,
          quantity: item.quantity || "Not specified"
        })
      );

      const { error } = await supabase.from('disaster_alerts').insert({
        title: data.title,
        description: data.description,
        location: formattedLocation,
        severity: data.severity,
        image_url: imageUrl,
        needed_relief: formattedReliefItems,
        created_by: user.id,
        contact_info: data.contactInfo,
        additional_notes: data.additionalNotes,
      });

      if (error) throw error;

      toast({
        title: "Alert Created",
        description: "Your disaster alert has been successfully created.",
      });

      form.reset();
      setSelectedImage(null);
      setReliefItems([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create alert. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-2xl font-bold text-[#372af5] mb-6 flex items-center">
            <AlertCircle className="mr-3 h-6 w-6 text-[#372af5]" />
            Disaster Information
          </h3>
          
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="mb-6">
                <FormLabel className="text-base">Title</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter alert title" 
                    className="text-base" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription className="text-sm text-gray-500">
                  Provide a clear, concise title for the disaster alert
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base">Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe the disaster situation in detail"
                    className="min-h-[120px] text-base resize-y"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-2xl font-bold text-[#372af5] mb-6 flex items-center">
            <MapPin className="mr-3 h-6 w-6 text-[#372af5]" />
            Location Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="location.district"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">District</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter district" 
                      className="text-base"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location.municipality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Municipality/VDC</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter municipality or VDC" 
                      className="text-base"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location.ward"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Ward No.</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter ward number" 
                      className="text-base"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location.specificLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Specific Location</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter specific location or landmark" 
                      className="text-base"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-2xl font-bold text-[#ea384c] mb-6 flex items-center">
            <AlertCircle className="mr-3 h-6 w-6 text-[#ea384c]" />
            Severity & Relief Needs
          </h3>

          <FormField
            control={form.control}
            name="severity"
            render={({ field }) => (
              <FormItem className="mb-6">
                <FormLabel>Severity Level</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium flex items-center text-[#0EA5E9]">
                <Package className="mr-2 h-5 w-5" />
                Relief Items Needed
              </h4>
              <Button
                type="button"
                onClick={addReliefItem}
                className="bg-[#372af5] hover:bg-[#372af5]/90 text-white flex items-center gap-2"
              >
                Add Item
              </Button>
            </div>

            {reliefItems.map((item, index) => (
              <div key={index} className="flex gap-3 items-start">
                <Input
                  placeholder="Item name"
                  value={item.item}
                  onChange={(e) => updateReliefItem(index, "item", e.target.value)}
                  className="flex-1"
                />
                <Select
                  value={item.priority}
                  onValueChange={(value) => updateReliefItem(index, "priority", value)}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Quantity"
                  value={item.quantity || ""}
                  onChange={(e) => updateReliefItem(index, "quantity", e.target.value)}
                  className="w-[120px]"
                />
                <Button
                  type="button"
                  onClick={() => removeReliefItem(index)}
                  className="bg-[#ea384c] hover:bg-[#ea384c]/90 text-white"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-2xl font-bold text-[#372af5] mb-6 flex items-center">
            <Upload className="mr-3 h-6 w-6 text-[#372af5]" />
            Additional Information
          </h3>
          
          <FormField
            control={form.control}
            name="contactInfo"
            render={({ field }) => (
              <FormItem className="mb-6">
                <FormLabel className="text-base">Contact Information</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter contact details for coordination" 
                    className="text-base"
                    {...field} 
                  />
                </FormControl>
                <FormDescription className="text-sm text-gray-500">
                  Provide contact information for better coordination
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="additionalNotes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base">Additional Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Any additional information that might be helpful"
                    className="min-h-[100px] text-base resize-y"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-2xl font-bold text-[#372af5] mb-6 flex items-center">
            <Image className="mr-3 h-6 w-6 text-[#372af5]" />
            Image Upload
          </h3>
          
          <div className="space-y-4">
            <div className="flex flex-col space-y-4">
              <label 
                htmlFor="image-upload" 
                className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-200 border-dashed rounded-lg appearance-none cursor-pointer hover:border-[#0EA5E9] focus:outline-none"
              >
                <div className="flex flex-col items-center space-y-2">
                  <Upload className="w-8 h-8 text-[#372af5]" />
                  <span className="text-sm text-gray-600">
                    Click to upload an image
                  </span>
                </div>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              {selectedImage && (
                <div className="flex items-center justify-between p-4 bg-[#372af5]/10 rounded-lg">
                  <span className="text-sm text-[#372af5] font-medium">
                    ✓ {selectedImage.name}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-[#ea384c] hover:text-[#ea384c]/90"
                    onClick={() => setSelectedImage(null)}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>
            <FormDescription className="text-sm text-gray-500">
              Upload images of the disaster area to help responders better understand the situation
            </FormDescription>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full py-6 text-lg font-semibold bg-[#372af5] hover:bg-[#372af5]/90 text-white
                     focus:ring-[#0EA5E9]/50 transition-all duration-200"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            "Creating Alert..."
          ) : (
            <span className="flex items-center justify-center gap-2">
              Create Alert
              <AlertCircle className="h-5 w-5" />
            </span>
          )}
        </Button>
      </form>
    </Form>
  );
};
