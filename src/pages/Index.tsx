import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Heart, Shield, Users } from "lucide-react";
import { DonationForm } from "@/components/DonationForm";

const Index = () => {
  const [showDonationForm, setShowDonationForm] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <div className="pt-24 pb-16 px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            ReliefLink Nepal
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed font-sans">
            सहयोग र सहकार्य - Connecting communities, coordinating relief efforts, and making a difference in times of need.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              size="lg"
              className="bg-blue-700 hover:bg-blue-800 text-white px-8 font-semibold shadow-lg hover:shadow-xl transition-all active:bg-blue-900 active:text-white focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
              onClick={() => navigate('/login')}
            >
              Make a Donation <Heart className="ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-blue-700 text-blue-700 hover:bg-blue-700 hover:text-white font-semibold active:bg-blue-800 active:text-white focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
              onClick={() => navigate('/alerts')}
            >
              View Alerts <ArrowRight className="ml-2" />
            </Button>
          </div>
        </div>
      </div>

      <div className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <Shield className="text-blue-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Rapid Response</h3>
              <p className="text-gray-700 leading-relaxed">
                Real-time alerts and coordination for immediate disaster response
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <Users className="text-blue-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Community Network</h3>
              <p className="text-gray-700 leading-relaxed">
                Connected network of volunteers and resources across Nepal
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <Heart className="text-blue-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Direct Impact</h3>
              <p className="text-gray-700 leading-relaxed">
                Efficient distribution of aid and supplies to affected areas
              </p>
            </div>
          </div>
        </div>
      </div>

      {showDonationForm && (
        <div className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <DonationForm />
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;