import { test } from "node:test";
import assert from "node:assert/strict";
import { ABOUT, allAboutStrings } from "../src/lib/aboutCopy";
import { translate } from "../src/lib/i18n/tx";

test("every sentence on the About page has an Italian version", () => {
  const missing = allAboutStrings().filter((s) => translate("it", s) === s && s !== "Cookie policy");
  assert.deepEqual(missing, []);
});

test("the version line keeps its number in both languages", () => {
  assert.equal(translate("en", ABOUT.version, { v: "1.0.0" }).startsWith("Version 1.0.0"), true);
  assert.equal(translate("it", ABOUT.version, { v: "1.0.0" }).startsWith("Versione 1.0.0"), true);
});

test("the Italian privacy notice keeps the key commitments", () => {
  const lives = translate("it", ABOUT.lives);
  assert.match(lives, /mai il tuo nome, l'email, la foto o i dati fisici/);
  assert.match(lives, /non viene salvata su un server/);
  assert.match(translate("it", ABOUT.localItems[5]), /mai caricati online/);
});
