import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatsCard } from "./StatsCard.jsx";
import React from "react";

describe("StatsCard", () => {
  it("renders correct title, value, icon, and colors", () => {
    render(<StatsCard title="Total Tasks" value={42} icon="✏️" color="teal" />);
    expect(screen.getByText("Total Tasks")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("✏️")).toBeInTheDocument();
  });
});
