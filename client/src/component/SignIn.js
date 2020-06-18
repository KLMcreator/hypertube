// react
import React, { useState, useEffect } from "react";
// framework
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";

const SignIn = (props) => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");

  const submitLogin = (e) => {
    e.preventDefault();
    fetch("/api/login", {
      method: "POST",
      body: JSON.stringify({
        login: login,
        password: password,
      }),
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.login === true) {
          props.auth.setLogged();
          props.props.history.push("/");
        } else if (res.login === false) {
          props.auth.errorMessage("Invalid credentials");
        } else {
          props.auth.errorMessage(res.login.msg);
        }
      })
      .catch((err) => props.auth.errorMessage(err));
  };

  return (
    <div>
      <form onSubmit={submitLogin}>
        <TextField
          required
          id="login"
          label="Username or Email"
          value={login}
          onChange={(e) => {
            setLogin(e.target.value);
          }}
          type="text"
        />
        <TextField
          required
          id="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
        />
        <Button variant="outlined" color="secondary" type="submit">
          Sign in
        </Button>
      </form>
    </div>
  );
};

export default SignIn;
