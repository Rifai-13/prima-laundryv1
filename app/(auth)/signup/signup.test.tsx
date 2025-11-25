import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { vi, describe, it, expect, beforeEach, Mock } from "vitest";
import SignUp from "./page";

// 1. Mock 'next/navigation' (useRouter)
const mockRouter = {
  push: vi.fn(),
  refresh: vi.fn(),
  back: vi.fn(),
};
vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
}));
// 2. Mock 'useToast'
const mockToast = vi.fn();
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));
// 3. Mock 'fetch' global
global.fetch = vi.fn();
// ----- Helper Function untuk Mengisi Form -----
const fillForm = (
  name = "Budi Santoso",
  email = "budi@gmail.com",
  password = "password123",
  confirmPassword = "password123"
) => {
  fireEvent.change(screen.getByLabelText("Full Name"), {
    target: { value: name },
  });
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: email },
  });
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: password },
  });
  fireEvent.change(screen.getByLabelText("Confirm Password"), {
    target: { value: confirmPassword },
  });
};
// ----- Mulai Test -----
describe("SignUp Form", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as Mock).mockReset();
  });

  // --- TC-01: Gagal Validasi Client ---
  it("TC-01: Harus gagal jika validasi client tidak lolos (e.g., password mismatch)", async () => {
    // 1. ARRANGE
    render(<SignUp />);

    // 2. ACT
    fillForm(
      "Budi",
      "budi@gmail.com",
      "password123",
      "passwordSALAH"
    );
    fireEvent.click(screen.getByText("Sign Up"));

    // 3. ASSERT
    // (S3) Toast error validasi harus muncul
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "Tolong perbaiki error pada form",
        })
      );
    });
    // API call tidak boleh terjadi
    expect(global.fetch).not.toHaveBeenCalled();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  // --- TC-02: Sukses Registrasi ---
  it("TC-02: Harus berhasil mendaftar dan redirect (Sukses Registrasi)", async () => {
    // 1. ARRANGE
    // Kondisi: response.ok = true
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ message: "Sukses" }),
    });
    render(<SignUp />);

    // 2. ACT
    fillForm(
      "Budi Santoso",
      "budi@gmail.com",
      "password123",
      "password123"
    );
    fireEvent.click(screen.getByText("Sign Up"));

    // 3. ASSERT
    await waitFor(() => {
      // (S5) fetch dipanggil dengan data yang benar
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/auth/signup",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("budi@gmail.com"),
        })
      );
      // (S9) Toast sukses muncul
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "Akun berhasil dibuat",
        })
      );
      // (S10) Redirect ke signin
      expect(mockRouter.push).toHaveBeenCalledWith("/signin");
    });
  });

  // --- TC-03: Gagal Registrasi (Server Error) ---
  it("TC-03: Harus menampilkan error jika server gagal (e.g., email sudah ada)", async () => {
    // 1. ARRANGE
    // (S7) Kondisi: response.ok = false
    // (S8) Error dilempar dengan pesan spesifik
    const serverError = "Email sudah terdaftar";
    (global.fetch as Mock).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: serverError }),
    });
    render(<SignUp />);

    // 2. ACT
    fillForm(
      "Budi Santoso",
      "budi@gmail.com",
      "password123",
      "password123"
    );
    fireEvent.click(screen.getByText("Sign Up"));

    // 3. ASSERT
    await waitFor(() => {
      // (S11) Toast error spesifik dari server muncul
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: serverError,
        })
      );
      // (S10) Tidak boleh redirect
      expect(mockRouter.push).not.toHaveBeenCalled();
    });
  });
});