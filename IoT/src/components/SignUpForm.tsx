import React, { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  TextField,
  Button,
  Container,
  Typography,
  Alert,
  Box,
} from "@mui/material";
import { Link } from "react-router-dom";

interface Account {
  username: string;
  email: string;
  password: string;
}

interface Errors {
  username?: string;
  email?: string;
  password?: string;
  general?: string;
}

const SignUpForm: React.FC = () => {
  const [account, setAccount] = useState<Account>({
    username: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const navigate = useNavigate();

  const validate = (): Errors | null => {
    const validationErrors: Errors = {};

    if (account.username.trim() === "") {
      validationErrors.username = "Username is required!";
    }
    if (account.email.trim() === "") {
      validationErrors.email = "Email is required!";
    }
    if (account.password.trim() === "") {
      validationErrors.password = "Password is required!";
    }

    return Object.keys(validationErrors).length === 0 ? null : validationErrors;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors || {});
    if (validationErrors) return;

    axios
      .post("http://localhost:3100/api/user/create", {
        name: account.username,
        email: account.email,
        password: account.password,
      })
      .then(() => {
        navigate("/login");
      })
      .catch((error) => {
        const errorMessages: Errors = {};
        if (error.response?.data?.error) {
          errorMessages.general = error.response.data.error;
        } else {
          errorMessages.general = "Something went wrong. Please try again.";
        }
        setErrors(errorMessages);
        console.error(error);
      });
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setAccount((prevAccount) => ({
      ...prevAccount,
      [name]: value,
    }));
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom>
        Sign Up
      </Typography>
      <form onSubmit={handleSubmit}>
        <Box mb={2}>
          <TextField
            label="Username"
            value={account.username}
            name="username"
            onChange={handleChange}
            fullWidth
            variant="outlined"
            error={Boolean(errors.username)}
            helperText={errors.username}
            sx={{
              input: { color: "white" },
              label: { color: "rgba(255,255,255,0.7)" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "rgba(255,255,255,0.3)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(255,255,255,0.7)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#1976d2",
                },
              },
              backgroundColor: "#333",
              borderRadius: 1,
            }}
          />
        </Box>
        <Box mb={2}>
          <TextField
            label="Email"
            value={account.email}
            name="email"
            onChange={handleChange}
            type="email"
            fullWidth
            variant="outlined"
            error={Boolean(errors.email)}
            helperText={errors.email}
            sx={{
              input: { color: "white" },
              label: { color: "rgba(255,255,255,0.7)" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "rgba(255,255,255,0.3)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(255,255,255,0.7)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#1976d2",
                },
              },
              backgroundColor: "#333",
              borderRadius: 1,
            }}
          />
        </Box>
        <Box mb={2}>
          <TextField
            label="Password"
            value={account.password}
            name="password"
            onChange={handleChange}
            type="password"
            fullWidth
            variant="outlined"
            error={Boolean(errors.password)}
            helperText={errors.password}
            sx={{
              input: { color: "white" },
              label: { color: "rgba(255,255,255,0.7)" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "rgba(255,255,255,0.3)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(255,255,255,0.7)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#1976d2",
                },
              },
              backgroundColor: "#333",
              borderRadius: 1,
            }}
          />
        </Box>
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Sign Up
        </Button>
        {errors.general && (
          <Box mt={2}>
            <Alert severity="error">{errors.general}</Alert>
          </Box>
        )}
      </form>
      <Typography mt={2} align="center" sx={{ color: "rgba(255,255,255,0.7)" }}>
        Masz już konto?{" "}
        <Link
          to="/login"
          style={{
            color: "#1976d2",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          Zaloguj się
        </Link>
      </Typography>
    </Container>
  );
};

export default SignUpForm;
