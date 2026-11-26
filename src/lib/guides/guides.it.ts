import type { GuideTable } from "./index";
import { PULL } from "./it/pull";
import { PUSH } from "./it/push";
import { CORE } from "./it/core";
import { LEGS } from "./it/legs";
import { MOVE } from "./it/move";
import { YOGA } from "./it/yoga";
import { YOGA2 } from "./it/yoga2";
import { PILATES } from "./it/pilates";
import { HOME } from "./it/home";

// Guide in italiano (vedi index.ts), riga per riga come quelle inglesi. Caricate su richiesta.
export const GUIDES: GuideTable = { ...PULL, ...PUSH, ...CORE, ...LEGS, ...MOVE, ...HOME, ...YOGA, ...YOGA2, ...PILATES };
