'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings as SettingsIcon, Bell, Moon, Sun, Globe } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-white font-mono">Settings</h1>
        <p className="text-white/80 mt-1">
          Manage your account and application preferences
        </p>
      </div>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-black font-mono">
            <Moon className="w-5 h-5 mr-2" />
            Appearance
          </CardTitle>
          <CardDescription className="text-gray-600">
            Customize the look and feel of the application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-black">Theme</p>
              <p className="text-sm text-gray-600">Choose your preferred theme</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Sun className="w-4 h-4 mr-2" />
                Light
              </Button>
              <Button variant="default" size="sm" className="bg-[#AA0000] hover:bg-[#CC0000]">
                <Moon className="w-4 h-4 mr-2" />
                Dark
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Notifications
          </CardTitle>
          <CardDescription>
            Configure how you receive updates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Price Alerts</p>
              <p className="text-sm text-muted-foreground">Get notified when prices hit your targets</p>
            </div>
            <Badge variant="default">Enabled</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Strategy Signals</p>
              <p className="text-sm text-muted-foreground">Receive trading signals from strategies</p>
            </div>
            <Badge variant="default">Enabled</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Market Updates</p>
              <p className="text-sm text-muted-foreground">Daily market summary and news</p>
            </div>
            <Badge variant="secondary">Disabled</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Trading Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <SettingsIcon className="w-5 h-5 mr-2" />
            Trading Preferences
          </CardTitle>
          <CardDescription>
            Set your default trading parameters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Default Chart Interval</p>
              <p className="text-sm text-muted-foreground">Your preferred time interval for charts</p>
            </div>
            <Badge variant="outline">1 Day</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Default Period</p>
              <p className="text-sm text-muted-foreground">Default historical data range</p>
            </div>
            <Badge variant="outline">1 Month</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Currency</p>
              <p className="text-sm text-muted-foreground">Display currency for prices</p>
            </div>
            <Badge variant="outline">USD</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Regional Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="w-5 h-5 mr-2" />
            Regional Settings
          </CardTitle>
          <CardDescription>
            Configure timezone and market preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Timezone</p>
              <p className="text-sm text-muted-foreground">Your local timezone</p>
            </div>
            <Badge variant="outline">UTC-5 (EST)</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Primary Market</p>
              <p className="text-sm text-muted-foreground">Default market for symbol search</p>
            </div>
            <Badge variant="outline">US Stocks</Badge>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle>About Destiny</CardTitle>
          <CardDescription>
            Trading platform information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Version:</strong> 1.0.0</p>
            <p><strong>Build:</strong> Production</p>
            <p><strong>API Status:</strong> <Badge variant="default">Active</Badge></p>
            <p className="text-muted-foreground mt-4">
              Destiny is a professional trading platform providing real-time market data,
              advanced charting, and sophisticated strategy analysis.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
