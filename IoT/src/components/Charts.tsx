import * as React from "react";
import { LineChart } from "@mui/x-charts";

interface DataType {
  temperature: number;
  brightness: number;
  humidity: number;
  roomId: number;
  readingDate: string;
}

interface ChartsProps {
  roomId: number | null;
}

const Charts: React.FC<ChartsProps> = ({ roomId }) => {
  const [data, setData] = React.useState<DataType[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (roomId === null) return;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const res = await fetch(`http://localhost:3100/api/room/${roomId}`, {
          headers: {
            "x-access-token": localStorage.getItem("token") || "",
          },
        });

        if (!res.ok) {
          const text = await res.text();
          console.error("Non-OK response for chart fetch:", res.status, text);
          throw new Error(`Server error ${res.status}: ${text}`);
        }

        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          const text = await res.text();
          console.error("Unexpected non-JSON response for chart fetch:", text);
          throw new Error(`Unexpected response from server: ${text}`);
        }

        const jsonData: DataType[] = await res.json();
        console.log("Charts: Loaded data:", jsonData, "Length:", jsonData.length);
        setData(jsonData);
      } catch (err: any) {
        console.error("Charts: Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [roomId]);

  if (roomId === null)
    return <div>Wybierz pokój, aby zobaczyć wykres</div>;
  if (loading) return <div>Ładowanie wykresu...</div>;
  if (error) return <div>Błąd ładowania wykresu: {error}</div>;
  if (data.length === 0) return <div>Brak danych do wykresu</div>;

  const sortedData = [...data].sort(
    (a, b) =>
      new Date(a.readingDate).getTime() - new Date(b.readingDate).getTime()
  );

  const dates = sortedData.map((d) => new Date(d.readingDate));
  const temperatureData = sortedData.map((d) => d.temperature);
  const brightnessData = sortedData.map((d) => d.brightness);
  const humidityData = sortedData.map((d) => d.humidity);

  return (
    <LineChart
      width={700}
      height={350}
      series={[
        { data: brightnessData, label: "Brightness (%)", color: "#90ee90" },
        { data: humidityData, label: "Humidity (%)", color: "#87cefa" },
        { data: temperatureData, label: "Temperature (°C)", color: "#ff00ff" },
      ]}
      xAxis={[
        {
          data: dates,
          scaleType: "time",
          label: "Data odczytu",
          labelStyle: { fill: "#fff", fontWeight: "bold" },
          stroke: "#fff",
          tickLabelStyle: { fill: "#fff", fontSize: 10 },
        },
      ]}
      yAxis={[
        {
          min: 0,
          max: 100,
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
        },
      }}
    />
  );
};

export default Charts;
