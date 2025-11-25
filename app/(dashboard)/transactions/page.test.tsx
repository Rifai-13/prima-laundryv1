import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { vi, describe, it, expect, beforeEach, Mock } from "vitest";
import TransactionsPage from "./page";
import { getTransactions } from "@/lib/data";

// ----- MOCKS -----

// 1. Mock fungsi getTransactions (Database logic)
vi.mock("@/lib/data", () => ({
  getTransactions: vi.fn(),
}));

// 2. Mock Komponen Anak (TransactionsTable & UI lain)
vi.mock("./components/transactions-table", () => ({
  TransactionsTable: ({ transactions }: { transactions: any[] }) => (
    <div data-testid="transactions-table">
      Data Count: {transactions.length}
    </div>
  ),
}));

vi.mock("@/components/layout/page-header", () => ({
  PageHeader: ({ title, children }: any) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

vi.mock("./components/new-transaction-button", () => ({
  NewTransactionButton: () => <button>New Transaction</button>,
}));

// ----- DATA DUMMY -----
const mockData = [
  { id: "1", customerName: "Budi", price: 50000 },
  { id: "2", customerName: "Siti", price: 25000 },
];

// ----- TEST SUITE -----

describe("TransactionsPage (Read Feature)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- TC-01: Read Sukses ---
  it("TC-01: Harus mengambil data transaksi dan merender tabel", async () => {
    // 1. ARRANGE
    // Simulasi database mengembalikan 2 data
    (getTransactions as Mock).mockResolvedValue(mockData);

    // 2. ACT
    const ui = await TransactionsPage();
    render(ui);

    // 3. ASSERT
    // Pastikan fungsi getTransactions dipanggil 1 kali
    expect(getTransactions).toHaveBeenCalledTimes(1);

    // Pastikan Header muncul
    expect(screen.getByText("Transactions")).toBeInTheDocument();

    // Pastikan Tabel menerima data yang benar (Count: 2)
    expect(screen.getByTestId("transactions-table")).toHaveTextContent(
      "Data Count: 2"
    );
  });

  // --- TC-02: Read Gagal (Database Error) ---
  it("TC-02: Harus menangani error gracefully (tetap render halaman walau data kosong)", async () => {
    // 1. ARRANGE
    // Simulasi database error/down
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {}); // Supress console error log
    (getTransactions as Mock).mockRejectedValue(new Error("Database Connection Failed"));

    // 2. ACT
    const ui = await TransactionsPage();
    render(ui);

    // 3. ASSERT
    // getTransactions tetap dipanggil
    expect(getTransactions).toHaveBeenCalledTimes(1);

    // Halaman TETAP harus muncul (Header ada)
    expect(screen.getByText("Transactions")).toBeInTheDocument();

    // Tabel harus menerima array kosong (Count: 0) karena di catch error kita set empty array
    expect(screen.getByTestId("transactions-table")).toHaveTextContent(
      "Data Count: 0"
    );

    // Pastikan error dicatat di console (opsional)
    expect(consoleSpy).toHaveBeenCalledWith(
      "Failed to fetch transactions:",
      expect.any(Error)
    );
    
    consoleSpy.mockRestore();
  });
});