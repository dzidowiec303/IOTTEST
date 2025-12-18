import * as React from "react";
import { LineChart } from "@mui/x-charts";
import { FormGroup, FormControlLabel, Checkbox, Box } from "@mui/material";

interface DataType {
  temperature: number;
  brightness: number;
  humidity: number;
  deviceId: number;
  readingDate: string;
}

const COLORS = [
  "#ffa726",
  "#66bb6a",
  "#42a5f5",
  "#ab47bc",
  "#ec407a",
  "#26a69a",
  "#d4e157",
  "#5c6bc0",
  "#ef5350",
  "#8d6e63",
  "#ff5722",
  "#009688",
  "#9c27b0",
  "#2196f3",
  "#4caf50",
  "#f44336",
];

const SUPPORTED_DEVICES = 17;

const ChartsMain: React.FC = () => {
  const [allData, setAllData] = React.useState<Record<number, DataType[]>>({});
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [visibleMetrics, setVisibleMetrics] = React.useState<string[]>([
    "temperature",
  ]);

  React.useEffect(() => {
    setLoading(true);
    setError(null);

    const fetchDeviceData = async (deviceId: number): Promise<DataType[]> => {
      try {
        const response = await fetch(
          `http://localhost:3100/api/data/${deviceId}/hour`,
          {
            headers: {
              "x-access-token": localStorage.getItem("token") || "",
            },
          }
        );

        if (response.status === 404) return [];
        if (!response.ok) throw new Error(`Błąd serwera ${response.status}`);

        return response.json();
      } catch (err) {
        console.warn(`Fetch failed for device ${deviceId}:`, err);
        return [];
      }
    };

    const deviceIds = Array.from({ length: SUPPORTED_DEVICES }, (_, i) => i);

    Promise.all(deviceIds.map(fetchDeviceData))
      .then((results) => {
        const dataMap: Record<number, DataType[]> = {};
        results.forEach((data, idx) => {
          dataMap[deviceIds[idx]] = data;
        });
        setAllData(dataMap);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Ładowanie danych...</div>;
  if (error) return <div>Błąd: {error}</div>;

  const devicesWithData = Object.entries(allData).filter(
    ([, deviceData]) => Array.isArray(deviceData) && deviceData.length > 0
  );

  // if (devicesWithData.length === 0)
  //   return <div>Brak danych do wyświetlenia</div>;

  const allDatesSet = new Set<number>();
  devicesWithData.forEach(([, deviceData]) => {
    deviceData.forEach((d) =>
      allDatesSet.add(new Date(d.readingDate).getTime())
    );
  });
  const allDates = Array.from(allDatesSet)
    .sort((a, b) => a - b)
    .map((t) => new Date(t));

  const metricLabels: Record<string, string> = {
    temperature: "Temperatura (°C)",
    brightness: "Jasność (%)",
    humidity: "Wilgotność (%)",
  };

  // const series = devicesWithData.flatMap(
  //   ([deviceIdStr, deviceData], deviceIdx) => {
  //     const sortedData = [...deviceData].sort(
  //       (a, b) =>
  //         new Date(a.readingDate).getTime() - new Date(b.readingDate).getTime()
  //     );

  //     return visibleMetrics.map((metric, metricIdx) => ({
  //       label: `Urządzenie ${deviceIdStr} — ${metricLabels[metric]}`,
  //       data: sortedData.map((d) => d[metric as keyof DataType] as number),
  //       color:
  //         COLORS[(deviceIdx + metricIdx * SUPPORTED_DEVICES) % COLORS.length],
  //     }));
  //   }
  // );

  const series = devicesWithData.flatMap(
  ([deviceIdStr, deviceData], deviceIdx) => {
    const dataMap = new Map(
      deviceData.map((d) => [
        new Date(d.readingDate).getTime(),
        d,
      ])
    );

    return visibleMetrics.map((metric, metricIdx) => ({
      label: `Urządzenie ${deviceIdStr} — ${metricLabels[metric]}`,
      data: allDates.map((date) => {
        const item = dataMap.get(date.getTime());
        return item ? (item[metric as keyof DataType] as number) : null;
      }),
      color:
        COLORS[(deviceIdx + metricIdx * SUPPORTED_DEVICES) % COLORS.length],
    }));
  }
);


  const handleToggleMetric = (metric: string) => {
    setVisibleMetrics((prev) =>
      prev.includes(metric)
        ? prev.filter((m) => m !== metric)
        : [...prev, metric]
    );
  };

  return (
    <>
      <h2 style={{ color: "#fff", marginBottom: "1rem" }}>
        Wykres danych z ostatniej godziny
      </h2>

      <Box mb={2}>
        <FormGroup row>
          {["temperature", "brightness", "humidity"].map((metric) => (
            <FormControlLabel
              key={metric}
              control={
                <Checkbox
                  checked={visibleMetrics.includes(metric)}
                  onChange={() => handleToggleMetric(metric)}
                  sx={{ color: "#fff" }}
                />
              }
              label={metricLabels[metric]}
              sx={{ color: "#fff" }}
            />
          ))}
        </FormGroup>
      </Box>

      <LineChart
        width={800}
        height={400}
        series={series}
        xAxis={[
          {
            data: allDates,
            scaleType: "time",
            label: "Data odczytu",
            labelStyle: { fill: "#fff", fontWeight: "bold" },
            stroke: "#fff",
            tickLabelStyle: { fill: "#fff", fontSize: 10 },
          },
        ]}
        yAxis={[
          {
            label: "Wartość",
            labelStyle: { fill: "#fff", fontWeight: "bold" },
            tickLabelStyle: { fill: "#fff" },
            stroke: "#fff",
          },
        ]}
        sx={{ backgroundColor: "#000" }}
        slotProps={{
          legend: {
            labelStyle: { fill: "#fff" },
            direction: "column",
            position: { vertical: "middle", horizontal: "right" },
          },
        }}
        tooltip={{
          trigger: "axis",
        }}
      />
    </>
  );
};

export default ChartsMain;
