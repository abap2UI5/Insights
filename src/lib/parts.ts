// The parts of the series, in reading order. The essays carry
// their part in the frontmatter; everything else about a part - its name, its
// one line, where it sits - lives here, once.

export const PART_IDS = ["rests", "how", "day", "where", "running", "coda"] as const;
export type PartId = (typeof PART_IDS)[number];

export interface Part {
  id: PartId;
  title: string;
  lead: string;
}

export const PARTS: Part[] = [
  {
    id: "rests",
    title: "Foundations",
    lead: "A whole app on one page first, then the three things it is built on: data whose type is only known at runtime, an app that is one class, and every UI5 control without a layer in between.",
  },
  {
    id: "how",
    title: "How It Works",
    lead: "The mechanism under the app, one piece per article. Read this part from start to end if you want to know why something works before you use it.",
  },
  {
    id: "day",
    title: "A Working Day",
    lead: "What an ABAP developer needs in the first week, and what each classic habit becomes: the client API, navigation, the URL, F4, messages, the LUW, locks, the long-running report, authorizations, the launchpad tile.",
  },
  {
    id: "where",
    title: "Where It Belongs in the Landscape",
    lead: "Releases, clean core, deployment shapes, and the technical criteria that decide between abap2UI5, RAP and UI5 Freestyle for a given screen.",
  },
  {
    id: "running",
    title: "Running It",
    lead: "What an architect asks before an installation goes productive: the threat model, where UI5 comes from, the sizing, the upgrade.",
  },
  {
    id: "coda",
    title: "Afterword",
    lead: "One consequence that was not planned: why AI agents handle these apps well.",
  },
];

export const partById = (id: PartId): Part => PARTS.find((p) => p.id === id)!;
