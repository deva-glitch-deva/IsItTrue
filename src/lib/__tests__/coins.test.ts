import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  dailyStreakBonus,
  isClockRollback,
  maxBetFor,
  winPayout,
} from "../coins";
import { SEED_CLAIMS } from "../seed-claims";

describe("coin math", () => {
  it("caps max bet at half the balance and at least 5", () => {
    assert.equal(maxBetFor(4), 0);
    assert.equal(maxBetFor(10), 5);
    assert.equal(maxBetFor(100), 50);
  });

  it("pays 2x on a win", () => {
    assert.equal(winPayout(5), 10);
    assert.equal(winPayout(25), 50);
  });

  it("awards a streak bonus after day one, capped at 15", () => {
    assert.equal(dailyStreakBonus(1), 0);
    assert.equal(dailyStreakBonus(2), 2);
    assert.equal(dailyStreakBonus(8), 14);
    assert.equal(dailyStreakBonus(20), 15);
  });

  it("detects clock rollback", () => {
    assert.equal(isClockRollback("2026-10-19", "2026-10-18"), true);
    assert.equal(isClockRollback("2026-10-19", "2026-10-19"), false);
    assert.equal(isClockRollback("2026-10-19", "2026-10-20"), false);
  });
});

describe("demo seeds", () => {
  it("covers all four verdicts and includes a reel sample", () => {
    const verdicts = new Set(SEED_CLAIMS.map((seed) => seed.verdict));
    assert.equal(verdicts.has("TRUE"), true);
    assert.equal(verdicts.has("FALSE"), true);
    assert.equal(verdicts.has("MISLEADING"), true);
    assert.equal(verdicts.has("UNVERIFIED"), true);
    const reel = SEED_CLAIMS.find((seed) => seed.slug === "nasa-darkness");
    assert.equal(reel?.inputType, "reel");
    assert.ok(reel?.reelUrl);
  });
});
