/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function() {

  // Define template paths to load
  const templatePaths = [

    // Actor Sheet Partials
    "systems/winter-of-discontent/templates/parts/coins.html",
    "systems/winter-of-discontent/templates/parts/attributes.html",
    "systems/winter-of-discontent/templates/parts/turf-list.html",
    "systems/winter-of-discontent/templates/parts/cohort-block.html",
    "systems/winter-of-discontent/templates/parts/factions.html",
    "systems/winter-of-discontent/templates/parts/active-effects.html",
  ];

  // Load the template parts
  return loadTemplates(templatePaths);
};
