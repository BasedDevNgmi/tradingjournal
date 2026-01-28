import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TradeForm } from "./trade-form/index";
import { TradesProvider } from "@/context/trade-context";

// Mock calculateRR to avoid dependency issues
jest.mock("@/lib/trade-utils", () => ({
  calculateRR: jest.fn(() => 2.5),
}));

describe("TradeForm Component", () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  test("renders Step 1 (Identity) initially", () => {
    render(
      <TradesProvider>
        <TradeForm onSubmit={mockOnSubmit} />
      </TradesProvider>
    );

    expect(screen.getByText(/1. Identity/i)).toBeInTheDocument();
    expect(screen.getByText(/Asset/i)).toBeInTheDocument();
    expect(screen.getByText(/Session/i)).toBeInTheDocument();
  });

  test("navigates through steps and validates input", async () => {
    render(
      <TradesProvider>
        <TradeForm onSubmit={mockOnSubmit} />
      </TradesProvider>
    );

    // Step 1: Identity
    const nextButton = screen.getByText(/Next Step/i);
    fireEvent.click(nextButton);

    // Wait for Step 2 to appear
    await waitFor(() => {
      expect(screen.getByText(/2. Playbook/i)).toBeInTheDocument();
    });

    // Step 2: Playbook
    fireEvent.click(screen.getByText(/Next Step/i));

    // Wait for Step 3 to appear
    await waitFor(() => {
      expect(screen.getByText(/3. Execution/i)).toBeInTheDocument();
    });

    // Step 3: Execution - Validation check
    // If we click Next Step without entering values, it should stay on Step 3 or show errors
    // (Zod validation is async in react-hook-form)
    fireEvent.click(screen.getByText(/Next Step/i));
    
    // It should NOT go to Step 4 because entryPrice, stopLoss, etc. are 0 (invalid)
    await waitFor(() => {
      expect(screen.getByText(/3. Execution/i)).toBeInTheDocument();
    });
  });
});
