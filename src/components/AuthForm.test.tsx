import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuthForm } from "./AuthForm.jsx";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { ApiError } from "../lib/api";
import React from "react";

vi.mock("../context/AuthContext.js", () => ({
  useAuth: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...rest }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe("AuthForm", () => {
  const replaceMock = vi.fn();
  const loginMock = vi.fn();
  const registerMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({ replace: replaceMock } as unknown as ReturnType<typeof useRouter>);
  });

  it("redirects to dashboard if already logged in", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 1, username: "john" } as unknown as ReturnType<typeof useAuth>["user"],
      loading: false,
      login: loginMock,
      register: registerMock,
    } as unknown as ReturnType<typeof useAuth>);

    render(<AuthForm mode="login" />);
    expect(replaceMock).toHaveBeenCalledWith("/dashboard");
  });

  it("submits login form successfully", async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      login: loginMock.mockResolvedValue(undefined),
      register: registerMock,
    } as unknown as ReturnType<typeof useAuth>);

    render(<AuthForm mode="login" />);

    expect(screen.getByText("Selamat datang kembali")).toBeInTheDocument();

    const usernameInput = screen.getByLabelText("Username");
    const passwordInput = screen.getByLabelText("Password");
    const submitBtn = screen.getByRole("button", { name: "Masuk" });

    fireEvent.change(usernameInput, { target: { value: "john_doe" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitBtn);

    expect(loginMock).toHaveBeenCalledWith({ username: "john_doe", password: "password123" });
    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("submits register form successfully", async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      login: loginMock,
      register: registerMock.mockResolvedValue(undefined),
    } as unknown as ReturnType<typeof useAuth>);

    render(<AuthForm mode="register" />);

    expect(screen.getByText("Buat akun baru")).toBeInTheDocument();

    const usernameInput = screen.getByLabelText("Username");
    const passwordInput = screen.getByLabelText("Password");
    const submitBtn = screen.getByRole("button", { name: "Daftar sekarang" });

    fireEvent.change(usernameInput, { target: { value: "new_user" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitBtn);

    expect(registerMock).toHaveBeenCalledWith({ username: "new_user", password: "password123" });
    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/login?registered=success");
    });
  });

  it("displays error message on ApiError failure", async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      login: loginMock.mockRejectedValue(new ApiError("Invalid credentials", 401)),
      register: registerMock,
    } as unknown as ReturnType<typeof useAuth>);

    render(<AuthForm mode="login" />);

    const usernameInput = screen.getByLabelText("Username");
    const passwordInput = screen.getByLabelText("Password");
    const submitBtn = screen.getByRole("button", { name: "Masuk" });

    fireEvent.change(usernameInput, { target: { value: "john" } });
    fireEvent.change(passwordInput, { target: { value: "wrong" } });
    fireEvent.click(submitBtn);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Invalid credentials");
  });

  it("displays default error message on general connection failure", async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      login: loginMock.mockRejectedValue(new Error("Network Error")),
      register: registerMock,
    } as unknown as ReturnType<typeof useAuth>);

    render(<AuthForm mode="login" />);

    const usernameInput = screen.getByLabelText("Username");
    const passwordInput = screen.getByLabelText("Password");
    const submitBtn = screen.getByRole("button", { name: "Masuk" });

    fireEvent.change(usernameInput, { target: { value: "john" } });
    fireEvent.change(passwordInput, { target: { value: "pwd" } });
    fireEvent.click(submitBtn);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Email atau password salah.");
  });
});



