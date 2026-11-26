import type { GuideTable } from "./index";
import { PULL } from "./en/pull";
import { PUSH } from "./en/push";
import { CORE } from "./en/core";
import { LEGS } from "./en/legs";
import { MOVE } from "./en/move";
import { YOGA } from "./en/yoga";
import { YOGA2 } from "./en/yoga2";
import { YOGA3 } from "./en/yoga3";
import { YOGA4 } from "./en/yoga4";
import { PILATES } from "./en/pilates";
import { PILATES2 } from "./en/pilates2";
import { PILATES3 } from "./en/pilates3";

// English form guides (see index.ts). Loaded on demand.
export const GUIDES: GuideTable = { ...PULL, ...PUSH, ...CORE, ...LEGS, ...MOVE, ...YOGA, ...YOGA2, ...YOGA3, ...YOGA4, ...PILATES, ...PILATES2, ...PILATES3 };
