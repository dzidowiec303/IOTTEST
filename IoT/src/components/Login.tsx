import { Component, type ChangeEvent, type FormEvent } from "react";
import {
  TextField,
  Button,
  Container,
  Typography,
  Alert,
  Box,
} from "@mui/material";
import { type NavigateFunction, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

interface Account {
  username: string;
  password: string;
}

interface Errors {
  username?: string;
  password?: string;
  server?: string;
}

interface Props {
  navigate: NavigateFunction;
}

interface State {
  account: Account;
  errors: Errors;
}

class LoginForm extends Component<Props, State> {
  state: State = {
    account: {
      username: "",
      password: "",
    },
    errors: {},
  };

  validate = (): Errors | null => {
    const errors: Errors = {};
    const { account } = this.state;
    if (account.username.trim() === "") {
      errors.username = "Username is required!";
    }
    if (account.password.trim() === "") {
      errors.password = "Password is required!";
    }
    return Object.keys(errors).length === 0 ? null : errors;
  };

  handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors = this.validate();
    this.setState({ errors: errors || {} });
    if (errors) return;

    try {
      const response = await fetch("http://localhost:3100/api/user/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          login: this.state.account.username,
          password: this.state.account.password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        this.setState({ errors: { server: data.error || "Login failed" } });
        return;
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);
      this.props.navigate("/dashboard");
    } catch (error) {
      this.setState({ errors: { server: "Network error" } });
    }
  };

  handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const account = { ...this.state.account };
    account[event.currentTarget.name as keyof Account] =
      event.currentTarget.value;
    this.setState({ account });
  };

  render() {
    const { errors } = this.state;

    return (
      <Container maxWidth="sm">
        <Typography variant="h4" component="h1" gutterBottom>
          Login
        </Typography>
        <form onSubmit={this.handleSubmit}>
          <Box mb={2}>
            <TextField
              label="Username"
              value={this.state.account.username}
              name="username"
              onChange={this.handleChange}
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
              label="Password"
              value={this.state.account.password}
              name="password"
              onChange={this.handleChange}
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
          {errors.server && (
            <Box mt={2}>
              <Alert severity="error">{errors.server}</Alert>
            </Box>
          )}
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Login
          </Button>
        </form>
        <Typography mt={2} align="center">
          Nie masz konta?{" "}
          <Link
            to="/signup"
            style={{
              color: "#1976d2",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Zarejestruj się
          </Link>
        </Typography>
      </Container>
    );
  }
}

export default function LoginFormWithNavigate() {
  const navigate = useNavigate();
  return <LoginForm navigate={navigate} />;
}
