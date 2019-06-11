import algoliasearch from "algoliasearch";
import { isEmpty } from "./helpers";

const algoliaClient = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_API_KEY);
const index = algoliaClient.initIndex("items");

/**
 * This function accepts a string to perform a partial query search with the Algolia API, and
 * based on those results either fetches the item from the Blizzard API or returns a list of
 * options to search for.
 *
 * @param {string} query - The string to use for partial searching.
 * @param {string} filger - Exact filter to match results on.
 */
export async function searchItems(query: string, filter: string): Promise<any> {
    let results: algoliasearch.Response;

    try {
        results = await index.search({ query });
    } catch (err) {
        return [];
    }

    const response = results.hits;
    if (!isEmpty(filter)) {
        return response.filter((res) => res.name === filter);
    }

    return response;
}
