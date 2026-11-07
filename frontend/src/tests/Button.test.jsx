import { render, screen, fireEvent } from "@testing-library/react";
import Button from "../components/ui/Button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Hello</Button>);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("shows loading state and disables", () => {
    render(<Button loading>Loading</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("fires onClick", () => {
    const handler = vi.fn();
    render(<Button onClick={handler}>Click me</Button>);
    fireEvent.click(screen.getByText("Click me"));
    expect(handler).toHaveBeenCalledOnce();
  });
});
