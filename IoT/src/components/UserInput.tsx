import { useState } from "react";
import {
  Box,
  Typography,
  Stack,
  Button,
} from "@mui/material";

interface UserInputProps {
  roomId: number;
  onSuccess: () => void;
}

const UserInput: React.FC<UserInputProps> = ({
  roomId,
  onSuccess,
}) => {
  const [temperature, setTemperature] = useState("");
  const [humidity, setHumidity] = useState("");
  const [brightness, setBrightness] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const handleSubmit = async () => {
    if (
      temperature.trim() === "" ||
      brightness.trim() === "" ||
      humidity.trim() === ""
    ) {
      setError("Wypełnij wszystkie pola");
      return;
    }

    if (!userId) {
      setError("Brak ID użytkownika. Zaloguj się ponownie.");
      return;
    }

    const tempNum = parseFloat(temperature);
    const humNum = parseFloat(humidity);
    const brightNum = parseFloat(brightness);

    if (isNaN(tempNum) || isNaN(humNum) || isNaN(brightNum)) {
      setError("Podaj poprawne wartości liczbowe");
      return;
    }

    if (brightNum < 0 || brightNum > 100) {
      setError("Jasność powinna być między 0 a 100");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const bodyPayload = {
        room: {
          temperature: tempNum,
          brightness: brightNum,
          humidity: humNum,
          userId: userId,
        },
        roomId: Number(roomId),
      };

      console.log("Sending payload:", bodyPayload);

      const res = await fetch(`http://localhost:3100/api/room/${roomId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token || "",
        },
        body: JSON.stringify(bodyPayload),
      });

      if (!res.ok) {
        // Try to parse JSON, fallback to text so we can see HTML errors
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          const json = await res.json();
          setError(json.error || json.message || "Błąd dodawania danych");
        } else {
          const text = await res.text();
          console.error("Non-JSON response on add data:", res.status, text);
          setError(`Server returned: ${text}`);
        }
      } else {
        setTemperature("");
        setHumidity("");
        setBrightness("");
        onSuccess();
      }
    } catch (e: any) {
      setError("Błąd sieci: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 400,
        backgroundColor: "#2e2e2e",
        padding: 3,
        borderRadius: 2,
        color: "white",
      }}
    >
      <Typography variant="h6" gutterBottom>
        Dodaj odczyt do pokoju
      </Typography>

      <Stack spacing={2}>
        <input
          type="number"
          placeholder="ID pokoju"
          value={roomId}
          readOnly
          style={{
            padding: "8px",
            borderRadius: 4,
            border: "none",
            width: "100%",
            backgroundColor: "#333",
            color: "white",
            cursor: "not-allowed",
          }}
        />

        <input
          type="number"
          placeholder="Temperatura (°C)"
          value={temperature}
          onChange={(e) => setTemperature(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: 4,
            border: "none",
            width: "100%",
            backgroundColor: "#444",
            color: "white",
          }}
        />
        <input
          type="number"
          placeholder="Wilgotność (%)"
          value={humidity}
          onChange={(e) => setHumidity(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: 4,
            border: "none",
            width: "100%",
            backgroundColor: "#444",
            color: "white",
          }}
        />
        <input
          type="number"
          placeholder="Jasność (0-100%)"
          min="0"
          max="100"
          value={brightness}
          onChange={(e) => setBrightness(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: 4,
            border: "none",
            width: "100%",
            backgroundColor: "#444",
            color: "white",
          }}
        />

        <Button
          variant="contained"
          color="success"
          onClick={handleSubmit}
          disabled={loading}
          sx={{ borderRadius: 2 }}
        >
          {loading ? "Dodawanie..." : "Dodaj odczyt"}
        </Button>

        {error && (
          <Typography color="error" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
      </Stack>
    </Box>
  );
};

export default UserInput;
