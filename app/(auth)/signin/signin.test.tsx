import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { vi, describe, it, expect, beforeEach, Mock } from "vitest";
import SignIn from "./page";

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
const fillForm = (email = "user@gmail.com", password = "password123") => {
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: email },
  });
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: password },
  });
};

// ----- Mulai Test Suite -----

describe("SignIn Form", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as Mock).mockReset();
  });

  // --- TC-01: Gagal Validasi Client ---
  it("TC-01: Harus gagal jika email tidak menggunakan @gmail.com (Validasi Client)", async () => {
    // 1. ARRANGE
    render(<SignIn />);

    // 2. ACT
    fillForm("test@bukan-gmail.com");
    fireEvent.click(screen.getByText("Sign In"));

    // 3. ASSERT
    // (S3) Toast error harus muncul
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "Email harus menggunakan @gmail.com",
        })
      );
    });
    // (S4-S17) fetch tidak boleh dipanggil, loading tidak aktif
    expect(global.fetch).not.toHaveBeenCalled();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  // --- TC-02: Sukses Login ---
  it("TC-02: Harus berhasil login dan redirect (Sukses Login)", async () => {
    // 1. ARRANGE
    // (S7) Kondisi: response.ok = true
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ message: "Sukses" }),
    });
    render(<SignIn />);

    // 2. ACT
    fillForm("user@gmail.com", "password123");
    fireEvent.click(screen.getByText("Sign In"));

    // 3. ASSERT
    await waitFor(() => {
      // (S5) fetch dipanggil dengan data yang benar
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/auth/signin",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("user@gmail.com"),
        })
      );
      // (S9) Toast sukses muncul
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "Login berhasil",
        })
      );
      // (S10) Redirect ke dashboard
      expect(mockRouter.push).toHaveBeenCalledWith("/dashboard");
    });
  });

  // --- TC-03: Gagal: Email Tidak Terdaftar ---
  it("TC-03: Harus menampilkan error 'Email tidak terdaftar'", async () => {
    // 1. ARRANGE
    // (S7) Kondisi: response.ok = false
    // (S8) Error dilempar dengan pesan spesifik
    (global.fetch as Mock).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "Email tidak terdaftar" }),
    });
    render(<SignIn />);

    // 2. ACT
    fillForm("user@gmail.com", "password123");
    fireEvent.click(screen.getByText("Sign In"));

    // 3. ASSERT
    await waitFor(() => {
      // (S12 & S16) Toast error spesifik muncul
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "Email tidak terdaftar. Silakan daftar terlebih dahulu.",
        })
      );
      // (S10) Tidak boleh redirect
      expect(mockRouter.push).not.toHaveBeenCalled();
    });
  });

  // --- TC-04: Gagal: Password Tidak Valid ---
  it("TC-04: Harus menampilkan error 'Password tidak valid'", async () => {
    // 1. ARRANGE
    (global.fetch as Mock).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "Password tidak valid" }),
    });
    render(<SignIn />);

    // 2. ACT
    fillForm("user@gmail.com", "password123");
    fireEvent.click(screen.getByText("Sign In"));

    // 3. ASSERT
    await waitFor(() => {
      // (S13 & S16) Toast error spesifik muncul
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "Password tidak valid. Silakan coba lagi.",
        })
      );
    });
  });

  // --- TC-05: Gagal: Email Tidak Valid (dari Server) ---
  it("TC-05: Harus menampilkan error 'Email tidak valid' dari server", async () => {
    // 1. ARRANGE
    (global.fetch as Mock).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "Email tidak valid" }),
    });
    render(<SignIn />);

    // 2. ACT
    fillForm("user@gmail.com", "password123");
    fireEvent.click(screen.getByText("Sign In"));

    // 3. ASSERT
    await waitFor(() => {
      // (S14 & S16) Toast error spesifik muncul
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "Email harus menggunakan @gmail.com",
        })
      );
    });
  });

  // --- TC-06: Gagal: Error Lain-lain ---
  it("TC-06: Harus menampilkan pesan error generic dari server", async () => {
    // 1. ARRANGE
    (global.fetch as Mock).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "Koneksi database putus" }),
    });
    render(<SignIn />);

    // 2. ACT
    fillForm("user@gmail.com", "password123");
    fireEvent.click(screen.getByText("Sign In"));

    // 3. ASSERT
    await waitFor(() => {
      // (S15 & S16) Toast error generic (sesuai pesan) muncul
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "Koneksi database putus",
        })
      );
    });
  });
});