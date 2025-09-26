"use client";
import React, { useState, useEffect } from "react";

export default function StillingarPage() {
  // State for various settings
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("is");
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
  });
  const [privacy, setPrivacy] = useState({
    showProfile: true,
    shareLocation: false,
    dataTracking: false,
  });
  const [accessibility, setAccessibility] = useState({
    highContrast: false,
    largeText: false,
    reducedMotion: false,
  });

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("appSettings");
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setDarkMode(settings.darkMode || false);
      setLanguage(settings.language || "is");
      setNotifications(settings.notifications || { email: true, sms: false, push: true });
      setPrivacy(settings.privacy || { showProfile: true, shareLocation: false, dataTracking: false });
      setAccessibility(settings.accessibility || { highContrast: false, largeText: false, reducedMotion: false });
    }
  }, []);

  // Save settings to localStorage whenever they change
  const saveSettings = () => {
    const settings = {
      darkMode,
      language,
      notifications,
      privacy,
      accessibility,
    };
    localStorage.setItem("appSettings", JSON.stringify(settings));
    alert("Stillingar vistaðar!"); // Settings saved!
  };

  const resetSettings = () => {
    setDarkMode(false);
    setLanguage("is");
    setNotifications({ email: true, sms: false, push: true });
    setPrivacy({ showProfile: true, shareLocation: false, dataTracking: false });
    setAccessibility({ highContrast: false, largeText: false, reducedMotion: false });
    localStorage.removeItem("appSettings");
    alert("Stillingar endurstilltar!"); // Settings reset!
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Stillingar</h1>
        
        {/* Theme Settings */}
        <div className="bg-card rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🎨 Útlit</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="darkMode" className="text-sm font-medium">
                Dökkt þema
              </label>
              <input
                type="checkbox"
                id="darkMode"
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="language" className="text-sm font-medium">
                Tungumál
              </label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-background text-foreground focus:ring-primary focus:border-primary"
              >
                <option value="is">Íslenska</option>
                <option value="en">English</option>
                <option value="da">Dansk</option>
                <option value="no">Norsk</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-card rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🔔 Tilkynningar</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="emailNotifications" className="text-sm font-medium">
                Tölvupóstur tilkynningar
              </label>
              <input
                type="checkbox"
                id="emailNotifications"
                checked={notifications.email}
                onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="smsNotifications" className="text-sm font-medium">
                SMS tilkynningar
              </label>
              <input
                type="checkbox"
                id="smsNotifications"
                checked={notifications.sms}
                onChange={(e) => setNotifications({...notifications, sms: e.target.checked})}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="pushNotifications" className="text-sm font-medium">
                Push tilkynningar
              </label>
              <input
                type="checkbox"
                id="pushNotifications"
                checked={notifications.push}
                onChange={(e) => setNotifications({...notifications, push: e.target.checked})}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-card rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🔒 Persónuvernd</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="showProfile" className="text-sm font-medium">
                Sýna prófíl opinberlega
              </label>
              <input
                type="checkbox"
                id="showProfile"
                checked={privacy.showProfile}
                onChange={(e) => setPrivacy({...privacy, showProfile: e.target.checked})}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="shareLocation" className="text-sm font-medium">
                Deila staðsetningu
              </label>
              <input
                type="checkbox"
                id="shareLocation"
                checked={privacy.shareLocation}
                onChange={(e) => setPrivacy({...privacy, shareLocation: e.target.checked})}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="dataTracking" className="text-sm font-medium">
                Leyfa gagnasöfnun til greiningar
              </label>
              <input
                type="checkbox"
                id="dataTracking"
                checked={privacy.dataTracking}
                onChange={(e) => setPrivacy({...privacy, dataTracking: e.target.checked})}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        {/* Accessibility Settings */}
        <div className="bg-card rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">♿ Aðgengi</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="highContrast" className="text-sm font-medium">
                Mikill contrast
              </label>
              <input
                type="checkbox"
                id="highContrast"
                checked={accessibility.highContrast}
                onChange={(e) => setAccessibility({...accessibility, highContrast: e.target.checked})}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="largeText" className="text-sm font-medium">
                Stærri letur
              </label>
              <input
                type="checkbox"
                id="largeText"
                checked={accessibility.largeText}
                onChange={(e) => setAccessibility({...accessibility, largeText: e.target.checked})}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="reducedMotion" className="text-sm font-medium">
                Minnka hreyfingar
              </label>
              <input
                type="checkbox"
                id="reducedMotion"
                checked={accessibility.reducedMotion}
                onChange={(e) => setAccessibility({...accessibility, reducedMotion: e.target.checked})}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="bg-card rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">👤 Reikningur</h2>
          <div className="space-y-4">
            <button className="w-full sm:w-auto px-6 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors">
              Breyta lykilorði
            </button>
            <button className="w-full sm:w-auto px-6 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors">
              Uppfæra netfang
            </button>
            <button className="w-full sm:w-auto px-6 py-2 bg-destructive text-white rounded-md hover:bg-destructive/80 transition-colors">
              Eyða reikningi
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={saveSettings}
            className="px-8 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
          >
            Vista stillingar
          </button>
          <button
            onClick={resetSettings}
            className="px-8 py-3 bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition-colors font-medium"
          >
            Endurstilla
          </button>
        </div>
      </div>
    </div>
  );
}