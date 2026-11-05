// Registers every published language's dictionary. Imported by Node tooling (generator,
// audits, tests). The browser bundle loads only the current language instead.
import { registerDictionary, dictionaries } from './localization.js';
import ro from './translations/ro.json' with { type: 'json' };
import de from './translations/de.json' with { type: 'json' };
import fr from './translations/fr.json' with { type: 'json' };
import es from './translations/es.json' with { type: 'json' };
import it from './translations/it.json' with { type: 'json' };
import pt from './translations/pt.json' with { type: 'json' };
import pl from './translations/pl.json' with { type: 'json' };
import nl from './translations/nl.json' with { type: 'json' };

for (const [locale, dictionary] of Object.entries({ ro, de, fr, es, it, pt, pl, nl })) registerDictionary(locale, dictionary);

export { dictionaries };
