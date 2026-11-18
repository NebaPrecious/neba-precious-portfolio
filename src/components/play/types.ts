/** Scene descriptions passed from server pages to <PlayHero>. Serializable. */

export type PropKind = "brackets" | "camera" | "play" | "marbles" | "reel" | "clapper" | "envelope";

/** Physics toy box: blocks spelling words plus props (home, contact, 404). */
export type ToyboxScene = { type: "toybox"; words: string[]; props: PropKind[] };

/** Floating devices showing real project screenshots (work). */
export type DevicesScene = {
  type: "devices";
  screens: { url: string; width: number; height: number; href: string; label: string }[];
};

/** A spinning orbit of studio covers (studio). */
export type OrbitScene = {
  type: "orbit";
  cards: { url: string; width: number; height: number; href: string; label: string }[];
};

/** A badge on a lanyard you can grab and fling (about). */
export type LanyardScene = {
  type: "lanyard";
  portrait: string | null;
  name: string;
  title: string;
  lines: string[];
};

export type SceneSpec = ToyboxScene | DevicesScene | OrbitScene | LanyardScene;

/** Shared props every scene component receives. */
export type SceneProps<S extends SceneSpec> = {
  scene: S;
  eventSource: React.RefObject<HTMLElement | null>;
  paused: boolean;
  onReady?: () => void;
};
