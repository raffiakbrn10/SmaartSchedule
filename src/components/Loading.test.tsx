import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Loading } from "./Loading.jsx";
import React from "react";

describe("Loading", () => {
  it("renders with default label", () => {
    render(<Loading />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Memuat...")).toBeInTheDocument();
  });

  it("renders with custom label", () => {
    render(<Loading label="Please wait..." />);
    expect(screen.getByText("Please wait...")).toBeInTheDocument();
  });
});
