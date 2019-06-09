import algoliasearch from "algoliasearch";
import blizzard from "blizzard.js";
import { isEmpty } from "./helpers";

const algoliaClient = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_API_KEY);
const index = algoliaClient.initIndex("items");

const blizzClient = blizzard.initialize({
    key: process.env.BLIZZARD_CLIENT_ID,
    secret: process.env.BLIZZARD_CLIENT_SECRET,
});

/**
 * This function accepts a string to perform a partial query search with the Algolia API, and
 * based on those results either fetches the item from the Blizzard API or returns a list of
 * options to search for.
 *
 * @param {string} query - The string to use for partial searching.
 */
export async function searchItems(query: string): Promise<any> {
    let results: algoliasearch.Response;

    try {
        results = await index.search({ query });
    } catch (err) {
        return {
            items: [],
        };
    }

    if (!isEmpty(results)) {
        if (results.nbHits === 1) {
            try {
                const item = await blizzClient.wow.item({ id: results.hits[0].id });
                return {
                    items: [item],
                };
            } catch (err) {
                console.log(err);

                return {
                    items: [],
                };
            }
        } else {
            return {
                items: results.hits,
            };
        }
    }

    return {
        items: [],
    };
}
