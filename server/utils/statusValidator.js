const VALID_TRANSITIONS = {
  "Todo": ["InProgress"],
  "InProgress": ["Review", "Todo"],
  "Review": ["Completed", "InProgress"],
  "Completed": ["InProgress"]
};

export function isValidTransition(current, next) {
  if (!VALID_TRANSITIONS[current]) return false;
  return VALID_TRANSITIONS[current].includes(next);
}
