"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Search,
  User,
  Moon,
  Sun,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  Scatter,
  ScatterChart,
  ZAxis,
} from "recharts";
import { ThemeToggle } from "@/components/theme-toggle";

// More realistic mock data generation
const generateMockData = (count: number) => {
  const types = [
    "Temperature",
    "Humidity",
    "Pressure",
    "CO2",
    "Light",
    "Motion",
    "Energy",
  ];
  const locations = [
    "Office",
    "Warehouse",
    "Production Floor",
    "Server Room",
    "Outdoor",
    "Meeting Room",
    "Cafeteria",
  ];
  const now = new Date();

  return Array.from({ length: count }, (_, i) => {
    const type = types[Math.floor(Math.random() * types.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const timestamp = new Date(now.getTime() - i * 60000); // Each entry is 1 minute apart

    let value, unit, status;
    switch (type) {
      case "Temperature":
        value = (20 + Math.random() * 10).toFixed(1);
        unit = "°C";
        status = parseFloat(value) > 26 ? "Warning" : "Normal";
        break;
      case "Humidity":
        value = (40 + Math.random() * 30).toFixed(1);
        unit = "%";
        status = parseFloat(value) > 60 ? "Warning" : "Normal";
        break;
      case "Pressure":
        value = (1000 + Math.random() * 30).toFixed(0);
        unit = "hPa";
        status = "Normal";
        break;
      case "CO2":
        value = (350 + Math.random() * 300).toFixed(0);
        unit = "ppm";
        status = parseFloat(value) > 600 ? "Warning" : "Normal";
        break;
      case "Light":
        value = (100 + Math.random() * 900).toFixed(0);
        unit = "lux";
        status = parseFloat(value) < 300 ? "Warning" : "Normal";
        break;
      case "Motion":
        value = Math.random() > 0.7 ? "Detected" : "None";
        unit = "";
        status = value === "Detected" ? "Alert" : "Normal";
        break;
      case "Energy":
        value = (0.1 + Math.random() * 0.9).toFixed(2);
        unit = "kWh";
        status = parseFloat(value) > 0.8 ? "Warning" : "Normal";
        break;
    }

    return {
      id: i + 1,
      deviceId: `DEV${(i + 1).toString().padStart(3, "0")}`,
      sensorType: type,
      location: location,
      value: `${value}${unit}`,
      rawValue: parseFloat(value),
      timestamp: timestamp.toISOString().replace("T", " ").substr(0, 19),
      status: status,
    };
  });
};

// Move the mock data generation outside the component and make it stable
const mockIoTData = generateMockData(1000);
const TOTAL_DEVICES = mockIoTData.length;
const ACTIVE_SENSORS = mockIoTData.filter(item => item.status === "Normal").length;
const ALERT_COUNT = mockIoTData.filter(item => item.status === "Warning" || item.status === "Alert").length;

const aggregateData = (data: any[], key: string) => {
  return data
    .reduce((acc, curr) => {
      const existingEntry = acc.find(
        (item) => item.time === curr.timestamp.substr(11, 5)
      );
      if (existingEntry) {
        existingEntry[key] = curr.rawValue;
      } else {
        acc.push({ time: curr.timestamp.substr(11, 5), [key]: curr.rawValue });
      }
      return acc;
    }, [])
    .sort((a, b) => a.time.localeCompare(b.time));
};

const temperatureData = aggregateData(
  mockIoTData.filter((item) => item.sensorType === "Temperature"),
  "temperature"
);
const humidityData = aggregateData(
  mockIoTData.filter((item) => item.sensorType === "Humidity"),
  "humidity"
);

const energyConsumptionData = [
  { device: "HVAC", consumption: 450 },
  { device: "Lighting", consumption: 200 },
  { device: "Computers", consumption: 300 },
  { device: "Servers", consumption: 550 },
  { device: "Other", consumption: 150 },
];

const locationDistribution = mockIoTData.reduce((acc, curr) => {
  acc[curr.location] = (acc[curr.location] || 0) + 1;
  return acc;
}, {});

const locationData = Object.entries(locationDistribution).map(
  ([name, value]) => ({ name, value })
);

const sensorCorrelationData = mockIoTData
  .filter(
    (item) =>
      item.sensorType === "Temperature" || item.sensorType === "Humidity"
  )
  .map((item) => ({
    temperature: item.sensorType === "Temperature" ? item.rawValue : null,
    humidity: item.sensorType === "Humidity" ? item.rawValue : null,
  }))
  .filter((item) => item.temperature !== null && item.humidity !== null);

// Fake notifications
const notifications = [
  {
    id: 1,
    message: "High temperature alert in Server Room",
    timestamp: "2023-04-01 10:15:00",
    type: "alert",
  },
  {
    id: 2,
    message: "CO2 levels above threshold in Office",
    timestamp: "2023-04-01 09:30:00",
    type: "warning",
  },
  {
    id: 3,
    message: "Humidity levels normalized in Warehouse",
    timestamp: "2023-04-01 08:45:00",
    type: "info",
  },
  {
    id: 4,
    message: 'New device "DEV056" connected',
    timestamp: "2023-04-01 07:20:00",
    type: "info",
  },
  {
    id: 5,
    message: 'Scheduled maintenance for "DEV023" tomorrow',
    timestamp: "2023-03-31 18:00:00",
    type: "reminder",
  },
];

export default function DashboardPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterLocation, setFilterLocation] = useState("All");
  const [showNotifications, setShowNotifications] = useState(false);

  const filteredData = mockIoTData.filter(
    (item) =>
      (searchTerm === "" ||
        item.deviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sensorType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterType === "All" || item.sensorType === filterType) &&
      (filterLocation === "All" || item.location === filterLocation)
  );

  const indexOfLastItem = currentPage * 10;
  const indexOfFirstItem = indexOfLastItem - 10;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, filterLocation]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-2 bg-background border-b lg:px-6">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-foreground lg:text-2xl">
            IoT Dashboard
          </h1>
        </div>
        <div className="flex items-center space-x-2 lg:space-x-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search devices..."
              className="pl-8 w-64 bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[130px] lg:w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Types</SelectItem>
              <SelectItem value="Temperature">Temperature</SelectItem>
              <SelectItem value="Humidity">Humidity</SelectItem>
              <SelectItem value="Pressure">Pressure</SelectItem>
              <SelectItem value="CO2">CO2</SelectItem>
              <SelectItem value="Light">Light</SelectItem>
              <SelectItem value="Motion">Motion</SelectItem>
              <SelectItem value="Energy">Energy</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterLocation} onValueChange={setFilterLocation}>
            <SelectTrigger className="w-[130px] lg:w-[180px]">
              <SelectValue placeholder="Filter by location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Locations</SelectItem>
              <SelectItem value="Office">Office</SelectItem>
              <SelectItem value="Warehouse">Warehouse</SelectItem>
              <SelectItem value="Production Floor">Production Floor</SelectItem>
              <SelectItem value="Server Room">Server Room</SelectItem>
              <SelectItem value="Outdoor">Outdoor</SelectItem>
              <SelectItem value="Meeting Room">Meeting Room</SelectItem>
              <SelectItem value="Cafeteria">Cafeteria</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Notifications</DialogTitle>
                <DialogDescription>
                  Recent alerts and updates from your IoT devices.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-start space-x-2"
                  >
                    <div
                      className={`w-2 h-2 mt-2 rounded-full ${
                        notification.type === "alert"
                          ? "bg-red-500"
                          : notification.type === "warning"
                          ? "bg-yellow-500"
                          : "bg-blue-500"
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {notification.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
          <ThemeToggle />
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="p-4 space-y-4 lg:p-6 lg:space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{TOTAL_DEVICES}</div>
              <p className="text-xs text-muted-foreground">+10% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sensors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ACTIVE_SENSORS}</div>
              <p className="text-xs text-muted-foreground">+5% from last week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Data Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1.2M</div>
              <p className="text-xs text-muted-foreground">
                +20% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ALERT_COUNT}</div>
              <p className="text-xs text-muted-foreground">-2% from yesterday</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Temperature & Humidity Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={temperatureData}>
                      <XAxis dataKey="time" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="temperature"
                        stroke="#8884d8"
                        name="Temperature (°C)"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="humidity"
                        stroke="#82ca9d"
                        name="Humidity (%)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Energy Consumption</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={energyConsumptionData}>
                      <XAxis dataKey="device" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="consumption" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent IoT Data</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Device ID</TableHead>
                      <TableHead>Sensor Type</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Timestamp
                      </TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentItems.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">
                          {row.deviceId}
                        </TableCell>
                        <TableCell>{row.sensorType}</TableCell>
                        <TableCell>{row.location}</TableCell>
                        <TableCell>{row.value}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {row.timestamp}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              row.status === "Normal"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : row.status === "Warning"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                          >
                            {row.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex items-center justify-end space-x-2 py-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => paginate(currentPage + 1)}
                    disabled={indexOfLastItem >= filteredData.length}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Sensor Distribution by Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={locationData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {locationData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={`hsl(${index * 45}, 70%, 60%)`}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Temperature vs Humidity Correlation</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ScatterChart>
                      <XAxis
                        type="number"
                        dataKey="temperature"
                        name="Temperature"
                        unit="°C"
                      />
                      <YAxis
                        type="number"
                        dataKey="humidity"
                        name="Humidity"
                        unit="%"
                      />
                      <ZAxis type="number" range={[50]} />
                      <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                      <Scatter
                        name="Sensors"
                        data={sensorCorrelationData}
                        fill="#8884d8"
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className="col-span-full lg:col-span-1">
                <CardHeader>
                  <CardTitle>Sensor Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: "Normal",
                            value: mockIoTData.filter(
                              (item) => item.status === "Normal"
                            ).length,
                          },
                          {
                            name: "Warning",
                            value: mockIoTData.filter(
                              (item) => item.status === "Warning"
                            ).length,
                          },
                          {
                            name: "Alert",
                            value: mockIoTData.filter(
                              (item) => item.status === "Alert"
                            ).length,
                          },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#4caf50" />
                        <Cell fill="#ff9800" />
                        <Cell fill="#f44336" />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
