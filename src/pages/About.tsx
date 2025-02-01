const About = () => {
  return (
    <div className="min-h-screen bg-white pt-20 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">About RelifLink Nepal</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-700 text-lg mb-6 leading-relaxed">
            RelifLink Nepal is dedicated to creating a robust network of volunteers and resources
            to respond effectively to natural disasters across Nepal. We aim to bridge the gap
            between affected communities and relief efforts through real-time information sharing
            and coordinated response.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Help</h2>
          <ul className="list-disc list-inside text-gray-700 text-lg mb-6 space-y-2">
            <li>Real-time disaster alerts and updates</li>
            <li>Coordination of volunteer efforts</li>
            <li>Resource mobilization and distribution</li>
            <li>Community preparedness programs</li>
          </ul>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Impact</h2>
          <p className="text-gray-700 text-lg leading-relaxed">
            Since our inception, we have helped coordinate relief efforts across multiple
            districts in Nepal, mobilizing thousands of volunteers and delivering essential
            supplies to affected communities.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;