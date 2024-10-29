"use client";

import { useState, useEffect, useMemo } from "react";
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
import { Bell, ChevronLeft, ChevronRight, Search, User, X } from "lucide-react";
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
} from "recharts";

// More realistic mock data
const generateMockData = (count: number) => {
  const types = ["Temperature", "Humidity", "Pressure", "CO2", "Light"];
  const locations = [
    "Office",
    "Warehouse",
    "Production Floor",
    "Server Room",
    "Outdoor",
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
    }

    return {
      id: i + 1,
      deviceId: `DEV${(i + 1).toString().padStart(3, "0")}`,
      sensorType: type,
      location: location,
      value: `${value}${unit}`,
      timestamp: timestamp.toISOString().replace("T", " ").substr(0, 19),
      status: status,
    };
  });
};

const mockIoTData = generateMockData(100);

interface DataPoint {
  time: string;
  [key: string]: number | string;
}

const aggregateData = (
  data: Array<{ value: string; timestamp: string }>,
  key: string
): DataPoint[] => {
  return data
    .reduce((acc: DataPoint[], curr) => {
      const value = parseFloat(curr.value.replace(/[^0-9.]/g, ""));
      const existingEntry = acc.find(
        (item) => item.time === curr.timestamp.substr(11, 5)
      );
      if (existingEntry) {
        existingEntry[key] = value;
      } else {
        acc.push({ time: curr.timestamp.substr(11, 5), [key]: value });
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

// Merge temperature and humidity data
const combinedData = temperatureData.map((temp) => {
  const humidity = humidityData.find((h) => h.time === temp.time);
  return {
    ...temp,
    humidity: humidity?.humidity || null,
  };
});

const energyConsumptionData = [
  { device: "HVAC", consumption: 450 },
  { device: "Lighting", consumption: 200 },
  { device: "Computers", consumption: 300 },
  { device: "Servers", consumption: 550 },
  { device: "Other", consumption: 150 },
];

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
  const [mockData, setMockData] = useState<ReturnType<typeof generateMockData>>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterLocation, setFilterLocation] = useState("All");
  const [showNotifications, setShowNotifications] = useState(false);
  const itemsPerPage = 10;

  // Generate mock data only on client side
  useEffect(() => {
    setMockData(generateMockData(100));
  }, []);

  // Update all mockIoTData references to use mockData state
  const filteredData = mockData.filter(
    (item) =>
      (searchTerm === "" ||
        item.deviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sensorType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterType === "All" || item.sensorType === filterType) &&
      (filterLocation === "All" || item.location === filterLocation)
  );

  // Update chart data generation
  const temperatureData = useMemo(() => 
    aggregateData(
      mockData.filter((item) => item.sensorType === "Temperature"),
      "temperature"
    ),
    [mockData]
  );

  const humidityData = useMemo(() => 
    aggregateData(
      mockData.filter((item) => item.sensorType === "Humidity"),
      "humidity"
    ),
    [mockData]
  );

  // Update combined data
  const combinedData = useMemo(() => 
    temperatureData.map((temp) => {
      const humidity = humidityData.find((h) => h.time === temp.time);
      return {
        ...temp,
        humidity: humidity?.humidity || null,
      };
    }),
    [temperatureData, humidityData]
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, filterLocation]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-background border-b">
        <div className="flex items-center">
          <h1 className="text-2xl font-semibold text-foreground">
            IoT Dashboard
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
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
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Types</SelectItem>
              <SelectItem value="Temperature">Temperature</SelectItem>
              <SelectItem value="Humidity">Humidity</SelectItem>
              <SelectItem value="Pressure">Pressure</SelectItem>
              <SelectItem value="CO2">CO2</SelectItem>
              <SelectItem value="Light">Light</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterLocation} onValueChange={setFilterLocation}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Locations</SelectItem>
              <SelectItem value="Office">Office</SelectItem>
              <SelectItem value="Warehouse">Warehouse</SelectItem>
              <SelectItem value="Production Floor">Production Floor</SelectItem>
              <SelectItem value="Server Room">Server Room</SelectItem>
              <SelectItem value="Outdoor">Outdoor</SelectItem>
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
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Devices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockData.length}</div>
              <p className="text-xs text-muted-foreground">
                +10% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Sensors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockData.filter((item) => item.status === "Normal").length}
              </div>
              <p className="text-xs text-muted-foreground">
                +5% from last week
              </p>
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
              <div className="text-2xl font-bold">
                {mockData.filter((item) => item.status === "Warning").length}
              </div>
              <p className="text-xs text-muted-foreground">
                -2% from yesterday
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Temperature & Humidity Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={combinedData}>
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
          <Card>
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
                  <TableHead>Device ID</TableHead>
                  <TableHead>Sensor Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.deviceId}</TableCell>
                    <TableCell>{row.sensorType}</TableCell>
                    <TableCell>{row.location}</TableCell>
                    <TableCell>{row.value}</TableCell>
                    <TableCell>{row.timestamp}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          row.status === "Normal"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
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
      </main>
    </div>
  );
}
