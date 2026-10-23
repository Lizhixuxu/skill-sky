/**
 * Skill Sky — host half.
 *
 * The skin is pure client-side presentation: theme token overrides, the
 * starfield background, the twinkling flare stars, the sidebar clock with its
 * digital readout, and the diamond-dust splitter all live in ./client.
 * This half therefore carries no logic.
 */
export const name = 'skill-sky'
export const inject = []
export function apply() {
  // No host-side work — every visible part of the skin is rendered client-side.
}
