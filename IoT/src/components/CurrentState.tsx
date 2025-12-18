import React from "react";
import { Typography, Box, Divider } from "@mui/material";
import DeviceThermostatIcon from "@mui/icons-material/DeviceThermostat";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import OpacityIcon from "@mui/icons-material/Opacity";
import { Stack } from "@mui/material";

interface DataType {
  temperature: number;
  brightness: number;
  humidity: number;
  roomId: number;
}

interface CurrentStateProps {
  data: DataType;
}

const CurrentState: React.FC<CurrentStateProps> = ({ data }) => {
  // Walidacja zakresu
  const isTemperatureValid = data.temperature >= 15 && data.temperature <= 40;
  const isHumidityValid = data.humidity >= 30 && data.humidity <= 70;
  const isBrightnessValid = data.brightness >= 0 && data.brightness <= 100;

  const temperatureDisplay = isTemperatureValid 
    ? `${data.temperature}°C`
    : `${data.temperature}°C (19°C)`;
  
  const humidityDisplay = isHumidityValid
    ? `${data.humidity}%`
    : `${data.humidity}% (50%)`;
  
  const brightnessDisplay = isBrightnessValid
    ? `${data.brightness}%`
    : `${data.brightness}% (15%)`;

  return (
    <Box
      sx={{
        backgroundColor: "#2e2e2e",
        color: "#ffffff",
        padding: 3,
        borderRadius: 2,
        maxWidth: 400,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Pokój No. {data.roomId}
      </Typography>

      <Divider sx={{ borderColor: "#ffffff", mb: 2 }} />

      <Stack spacing={1}>
        <Typography
          variant="h6"
          component="div"
          display="flex"
          alignItems="center"
          gap={1}
          sx={{
            color: isTemperatureValid ? "#ffffff" : "#ff6b6b",
          }}
        >
          <DeviceThermostatIcon />
          <span>{temperatureDisplay}</span>
        </Typography>
        <Typography
          variant="h6"
          component="div"
          display="flex"
          alignItems="center"
          gap={1}
          sx={{
            color: isBrightnessValid ? "#ffffff" : "#ff6b6b",
          }}
        >
          <LightbulbIcon />
          <span>{brightnessDisplay}</span>
        </Typography>
        <Typography
          variant="h6"
          component="div"
          display="flex"
          alignItems="center"
          gap={1}
          sx={{
            color: isHumidityValid ? "#ffffff" : "#ff6b6b",
          }}
        >
          <OpacityIcon />
          <span>{humidityDisplay}</span>
        </Typography>
      </Stack>
    </Box>
  );
};

export default CurrentState;
