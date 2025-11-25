import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { vi, describe, it, expect, beforeEach, Mock } from "vitest";
import userEvent from "@testing-library/user-event";

import { TransactionsTable } from "./transactions-table";

// ----- MOCKS -----
const mockRouter = { refresh: vi.fn() };
vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
}));

const mockToast = vi.fn();
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
}));

global.fetch = vi.fn();

// ----- DATA DUMMY LENGKAP -----
const mockTransactions: any[] = [
  {
    id: "trx-123",
    customerName: "Budi Santoso",
    price: 50000,
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
    itemType: "Pakaian Sehari-hari",
    phoneNumber: "08123456789",
    weight: 5,
    gender: "male",
    serviceType: "express",
    additionalServices: ["setrika-ekstra"],
  },
];

// ----- TEST SUITE -----
describe("Fitur Delete di TransactionsTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as Mock).mockReset();
  });

  // --- TC-01: Buka Dialog Konfirmasi ---
  it("TC-01: Klik tombol delete di menu harus membuka dialog konfirmasi", async () => {
    // 1. SETUP USER EVENT
    const user = userEvent.setup();
    
    // 2. ARRANGE
    render(<TransactionsTable transactions={mockTransactions} />);

    // 3. ACT
    // Cari tombol trigger menu (titik tiga)
    const menuTrigger = screen.getByRole("button", { name: /open menu/i });
    
    // Klik menggunakan 'user.click' (bukan fireEvent)
    await user.click(menuTrigger);

    // Tunggu dan Klik "Delete" di menu dropdown
    const deleteMenuItem = await screen.findByText(/delete/i);
    await user.click(deleteMenuItem);

    // 4. ASSERT
    // Pastikan Dialog muncul
    expect(await screen.findByText("Delete Transaction")).toBeInTheDocument();
    expect(
      screen.getByText(/are you sure you want to delete/i)
    ).toBeInTheDocument();
  });

  // --- TC-02: Delete Sukses ---
  it("TC-02: Konfirmasi delete harus memanggil API dan refresh halaman", async () => {
    // 1. SETUP
    const user = userEvent.setup();
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ message: "Deleted" }),
    });

    render(<TransactionsTable transactions={mockTransactions} />);

    // 2. ACT
    // Buka menu -> Klik Delete
    await user.click(screen.getByRole("button", { name: /open menu/i }));
    const deleteMenuItem = await screen.findByText(/delete/i);
    await user.click(deleteMenuItem);

    // Tunggu Dialog muncul dan cari tombol konfirmasi "Delete"
    // Tips: Tombol konfirmasi biasanya tombol terakhir dengan nama "Delete"
    const confirmBtn = await screen.findByRole("button", { name: "Delete" });
    await user.click(confirmBtn);

    // 3. ASSERT
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/transactions/trx-123",
        expect.objectContaining({ method: "DELETE" })
      );
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Berhasil!" })
      );
      expect(mockRouter.refresh).toHaveBeenCalled();
    });
  });

  // --- TC-03: Delete Gagal ---
  it("TC-03: Menampilkan error toast jika API gagal", async () => {
    // 1. SETUP
    const user = userEvent.setup();
    (global.fetch as Mock).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "ID tidak valid" }),
    });

    render(<TransactionsTable transactions={mockTransactions} />);

    // 2. ACT
    // Buka menu -> Klik Delete
    await user.click(screen.getByRole("button", { name: /open menu/i }));
    const deleteMenuItem = await screen.findByText(/delete/i);
    await user.click(deleteMenuItem);

    // Klik Konfirmasi Delete
    const confirmBtn = await screen.findByRole("button", { name: "Delete" });
    await user.click(confirmBtn);

    // 3. ASSERT
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Error",
          description: "ID tidak valid",
          variant: "destructive",
        })
      );
      expect(mockRouter.refresh).not.toHaveBeenCalled();
    });
  });
});