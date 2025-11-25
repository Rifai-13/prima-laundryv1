import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { vi, describe, it, expect, beforeEach, Mock } from "vitest";
import { TransactionForm } from "./transaction-form";
import { Transaction } from "@/lib/types";

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
// di TC-01 dan TC-02.
const fillValidFormData = () => {
  fireEvent.change(screen.getByLabelText("Nama Pelanggan"), {
    target: { value: "Budi Santoso" },
  });
  fireEvent.click(screen.getByLabelText("Laki-laki"));
  fireEvent.change(screen.getByLabelText("Nomor Telepon"), {
    target: { value: "081234567890" },
  });
  fireEvent.change(screen.getByLabelText("Jenis Barang"), {
    target: { value: "Pakaian" },
  });
  fireEvent.change(screen.getByLabelText("Berat (kg)"), {
    target: { value: "5" },
  });
  fireEvent.change(screen.getByLabelText("Harga (Rp)"), {
    target: { value: "50000" },
  });
};
// ----- Mulai Test Suite -----
describe("TransactionForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as Mock).mockReset();
  });

  // --- TC-01: Create - Sukses ---
  it("TC-01: Harus submit data baru dengan sukses (Create - Sukses)", async () => {
    // 1. ARRANGE (Input/Kondisi)
    // Kondisi 1: `transaction` = undefined (tidak di-pass sebagai prop)
    // Kondisi 2: `response.ok` = true
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "123" }),
    });
    render(<TransactionForm />);
    // 2. ACT (Aksi Pengguna)
    fillValidFormData();
    fireEvent.click(screen.getByText("Buat Transaksi Baru"));
    // 3. ASSERT (Output yang Diharapkan)
    await waitFor(() => {
      // S5 (Method POST) & S3 (URL Create)
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/transactions",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("Budi Santoso"),
        })
      );
      // S10 (Refresh) & S11 (Push)
      expect(mockRouter.refresh).toHaveBeenCalled();
      expect(mockRouter.push).toHaveBeenCalledWith("/transactions");
      // S13 (Toast Create) & S14 (Toast Dipanggil)
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "Transaction created",
        })
      );
    });
  });

  // --- TC-02: Create - Gagal ---
  it("TC-02: Harus menampilkan error jika submit data baru gagal (Create - Gagal)", async () => {
    // 1. ARRANGE (Input/Kondisi)
    // Kondisi 1: `transaction` = undefined
    // Kondisi 2: `response.ok` = false
    (global.fetch as Mock).mockResolvedValue({
      ok: false,
    });
    render(<TransactionForm />);
    // 2. ACT
    fillValidFormData();
    fireEvent.click(screen.getByText("Buat Transaksi Baru"));
    // 3. ASSERT
    await waitFor(() => {
      // S9 (Error dilempar) & S15 (Toast Error dipanggil)
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Error",
          description: "Failed to save transaction",
        })
      );
      // S10 & S11 (Navigasi) tidak boleh dipanggil
      expect(mockRouter.push).not.toHaveBeenCalled();
    });
  });
  // Data mock untuk TC-03 dan TC-04
  const mockTransaction: Transaction = {
    id: "trx-123",
    customerName: "Siti Aminah",
    gender: "female",
    serviceType: "express",
    additionalServices: ["pewangi-khusus"],
    itemType: "Selimut",
    phoneNumber: "089876543210",
    weight: 3,
    price: 45000,
    status: "processing",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // --- TC-03: Update - Sukses ---
  it("TC-03: Harus submit data yang ada dengan sukses (Update - Sukses)", async () => {
    // 1. ARRANGE (Input/Kondisi)
    // Kondisi 1: `transaction` = object (di-pass sebagai prop)
    // Kondisi 2: `response.ok` = true
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "trx-123" }),
    });
    render(<TransactionForm transaction={mockTransaction} />);
    // 2. ACT
    fireEvent.click(screen.getByText("Simpan Perubahan"));
    // 3. ASSERT
    await waitFor(() => {
      // S4 (Method PUT) & S2 (URL Update)
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/transactions/${mockTransaction.id}`, // S2
        expect.objectContaining({
          method: "PUT", // S4
          body: expect.stringContaining("Siti Aminah"),
        })
      );
      // S10 & S11
      expect(mockRouter.refresh).toHaveBeenCalled();
      expect(mockRouter.push).toHaveBeenCalledWith("/transactions");
      // S12 (Toast Update) & S14 (Toast Dipanggil)
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "Transaction updated",
        })
      );
    });
  });

  // --- TC-04: Update - Gagal ---
  it("TC-04: Harus menampilkan error jika update data gagal (Update - Gagal)", async () => {
    // 1. ARRANGE (Input/Kondisi)
    // Kondisi 1: `transaction` = object
    // Kondisi 2: `response.ok` = false
    (global.fetch as Mock).mockResolvedValue({
      ok: false,
    });
    render(<TransactionForm transaction={mockTransaction} />);
    // 2. ACT
    fireEvent.click(screen.getByText("Simpan Perubahan"));
    // 3. ASSERT
    await waitFor(() => {
      // S9 & S15
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Error",
          description: "Failed to save transaction",
        })
      );
      // S10 & S11
      expect(mockRouter.push).not.toHaveBeenCalled();
    });
  });
});
