import IT_PHRASES from "./phrases.it";
import { makeTranslator } from "./txCore";

// translate(locale, text, vars) with the Italian table loaded up front: for
// the server (push messages) and tests. The app's screens translate through
// LanguageContext instead, which loads the table only for Italian users.
// How translation works: txCore.ts.
export const translate = makeTranslator(IT_PHRASES);
export { fill } from "./txCore";
