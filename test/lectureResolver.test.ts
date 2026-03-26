import { resolveLectures, type Lecture } from "../src/lectureResolver.js";

function assertDeepEqual<T>(actual: T, expected: T, message: string): void {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);

  if (actualJson !== expectedJson) {
    throw new Error(`${message}\nExpected: ${expectedJson}\nReceived: ${actualJson}`);
  }
}

function runTest(name: string, testCase: () => void): void {
  try {
    testCase();
    console.log(`PASS ${name}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`FAIL ${name}\n${message}`);
    throw error;
  }
}

runTest("combines lecture names, keeps remote timestamps, and merges note text for shared ids", () => {
  const local: Lecture = {
    name: "Name 1",
    notes: [
      { id: 1, timestamp: 3200, text: "A" },
      { id: 2, timestamp: 5600, text: "C" }
    ]
  };

  const remote: Lecture = {
    name: "Name 2",
    notes: [{ id: 1, timestamp: 2400, text: "B" }]
  };

  assertDeepEqual(resolveLectures(remote, local), {
    name: "Name 1 / Name 2",
    notes: [
      { id: 1, timestamp: 2400, text: "A / B" },
      { id: 2, timestamp: 5600, text: "C" }
    ]
  }, "Example resolution should match the expected merged lecture");
});

runTest("preserves identical lecture and note text without adding a slash", () => {
  const local: Lecture = {
    name: "Biology",
    notes: [{ id: "n1", timestamp: 500, text: "Cell theory" }]
  };

  const remote: Lecture = {
    name: "Biology",
    notes: [{ id: "n1", timestamp: 250, text: "Cell theory" }]
  };

  assertDeepEqual(resolveLectures(remote, local), {
    name: "Biology",
    notes: [{ id: "n1", timestamp: 250, text: "Cell theory" }]
  }, "Matching text should not be duplicated with a slash");
});

runTest("retains notes that exist only in the remote lecture", () => {
  const local: Lecture = {
    name: "History",
    notes: [{ id: 1, timestamp: 1000, text: "Local note" }]
  };

  const remote: Lecture = {
    name: "History v2",
    notes: [
      { id: 1, timestamp: 1100, text: "Remote note" },
      { id: 2, timestamp: 2000, text: "Remote only" }
    ]
  };

  assertDeepEqual(resolveLectures(remote, local), {
    name: "History / History v2",
    notes: [
      { id: 1, timestamp: 1100, text: "Local note / Remote note" },
      { id: 2, timestamp: 2000, text: "Remote only" }
    ]
  }, "Remote-only notes should be appended to the resolved lecture");
});

runTest("does not mutate either input lecture", () => {
  const local: Lecture = {
    name: "Physics",
    notes: [{ id: 1, timestamp: 400, text: "Velocity" }]
  };

  const remote: Lecture = {
    name: "Physics 2",
    notes: [{ id: 1, timestamp: 300, text: "Acceleration" }]
  };

  const localSnapshot = structuredClone(local);
  const remoteSnapshot = structuredClone(remote);

  resolveLectures(remote, local);

  assertDeepEqual(local, localSnapshot, "Local lecture should not be mutated");
  assertDeepEqual(remote, remoteSnapshot, "Remote lecture should not be mutated");
});