import { CreateAlertForm } from "@/components/CreateAlertForm";

const CreateAlert = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4 mt-16">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Create New Alert</h1>
          <CreateAlertForm />
        </div>
      </div>
    </div>
  );
};

export default CreateAlert;