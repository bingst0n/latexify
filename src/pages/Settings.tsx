import { Header } from "@/components/Header";

const Settings = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Account Settings</h1>
          <p className="text-muted-foreground">Coming soon</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
