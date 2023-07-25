import "@testing-library/jest-dom";

import { matchers } from "@emotion/jest";
import { render } from "@testing-library/react";

import AlternateButton from "./alternate";

const noop = () => {};

expect.extend(matchers);

describe("AlternateButton", () => {
  it("applies correct styles", () => {
    const { getByRole } = render(
      <AlternateButton onClick={noop}>Test Button</AlternateButton>
    );
    const button = getByRole("button");
    expect(button).toHaveStyleRule("border", "2px solid white");
    expect(button).toHaveStyleRule("border", "2px solid orange", {
      target: ":hover",
    });
    expect(button).toHaveStyleRule("border", "2px solid #2684ff", {
      target: ":focus",
    });
  });
});
