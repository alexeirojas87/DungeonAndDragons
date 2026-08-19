// ============================================================
// COMBAT ENGINE - Turn-based combat system
// The AI must never override combat results.
// ============================================================

import type {
  Character, Enemy, CombatEncounter, Combatant, CombatAction,
  CombatLogEntry, CombatState, Condition, DamageType, DiceRoll
} from './types';
import { rollD20, rollDamage, getAttributeModifier, rollDice } from './dice';
import { eventBus, createEvent } from './events';

let encounterCounter = 0;

export function createEncounter(
  party: Character[],
  enemies: Enemy[],
  environment: string[] = []
): CombatEncounter {
  const combatants: Combatant[] = [];

  // Add party members
  for (const char of party) {
    const initRoll = rollD20(getAttributeModifier(char.attributes.dexterity));
    combatants.push({
      id: char.id,
      name: char.name,
      nameEs: char.name,
      type: 'player',
      initiative: initRoll.total,
      hp: char.hp,
      maxHp: char.maxHp,
      ac: char.ac,
      conditions: [...char.conditions],
      portrait: char.portrait,
      isAlive: true,
    });
  }

  // Add enemies
  for (const enemy of enemies) {
    const initRoll = rollD20(getAttributeModifier(enemy.intelligence));
    combatants.push({
      id: enemy.id,
      name: enemy.name,
      nameEs: enemy.nameEs,
      type: 'enemy',
      initiative: initRoll.total,
      hp: enemy.hp,
      maxHp: enemy.maxHp,
      ac: enemy.ac,
      conditions: [...enemy.conditions],
      portrait: enemy.portrait,
      isAlive: true,
    });
  }

  // Sort by initiative (highest first)
  combatants.sort((a, b) => b.initiative - a.initiative);

  const encounter: CombatEncounter = {
    id: `encounter_${Date.now()}_${++encounterCounter}`,
    enemies,
    initiativeOrder: combatants,
    currentTurn: 0,
    round: 1,
    state: 'initiative',
    environment,
    log: [],
  };

  eventBus.emit(createEvent('COMBAT_STARTED', {
    encounterId: encounter.id,
    enemyCount: enemies.length,
    partySize: party.length,
  }));

  return encounter;
}

export function resolveAttack(
  attacker: Combatant,
  defender: Combatant,
  encounter: CombatEncounter,
  isSpell: boolean = false,
  spellDamage?: string,
  damageType?: DamageType
): { hit: boolean; damage: number; critical: boolean; roll: DiceRoll; logEntry: CombatLogEntry } {
  const attackRoll = rollD20(getAttributeModifier(attacker.type === 'player' ? 14 : 10));
  const hit = attackRoll.total >= defender.ac || attackRoll.isCritical;
  const critical = attackRoll.isCritical;

  let damage = 0;
  if (hit) {
    const damageStr = isSpell && spellDamage
      ? spellDamage
      : attacker.type === 'player' ? '1d8' : '1d4';
    const dmgMod = attacker.type === 'player' ? getAttributeModifier(14) : 0;
    const dmgRoll = rollDamage(damageStr, dmgMod);
    damage = critical ? dmgRoll.total * 2 : dmgRoll.total;
  }

  const logEntry: CombatLogEntry = {
    round: encounter.round,
    actorId: attacker.id,
    action: isSpell ? 'casts a spell' : 'attacks',
    actionEs: isSpell ? 'lanza un hechizo' : 'ataca',
    result: hit ? `${damage} damage dealt` : 'missed',
    resultEs: hit ? `${damage} de daño infligido` : 'falló',
    damage: hit ? damage : undefined,
  };

  encounter.log.push(logEntry);

  return { hit, damage, critical, roll: attackRoll, logEntry };
}

export function applyDamage(encounter: CombatEncounter, targetId: string, damage: number): void {
  const target = encounter.initiativeOrder.find(c => c.id === targetId);
  if (!target) return;

  target.hp = Math.max(0, target.hp - damage);

  if (target.hp <= 0) {
    target.isAlive = false;
    target.hp = 0;
  }

  eventBus.emit(createEvent('DAMAGE_APPLIED', {
    targetId,
    damage,
    remainingHp: target.hp,
    killed: target.hp <= 0,
  }));
}

export function applyHealing(encounter: CombatEncounter, targetId: string, amount: number): void {
  const target = encounter.initiativeOrder.find(c => c.id === targetId);
  if (!target) return;

  target.hp = Math.min(target.maxHp, target.hp + amount);

  eventBus.emit(createEvent('HEALING_APPLIED', {
    targetId,
    amount,
    remainingHp: target.hp,
  }));
}

export function addCondition(encounter: CombatEncounter, targetId: string, condition: Condition): void {
  const target = encounter.initiativeOrder.find(c => c.id === targetId);
  if (!target || target.conditions.includes(condition)) return;
  target.conditions.push(condition);
}

export function removeCondition(encounter: CombatEncounter, targetId: string, condition: Condition): void {
  const target = encounter.initiativeOrder.find(c => c.id === targetId);
  if (!target) return;
  target.conditions = target.conditions.filter(c => c !== condition);
}

export function nextTurn(encounter: CombatEncounter): Combatant | null {
  // Skip dead combatants
  let nextIdx = (encounter.currentTurn + 1) % encounter.initiativeOrder.length;

  // Find next alive combatant
  let attempts = 0;
  while (!encounter.initiativeOrder[nextIdx].isAlive && attempts < encounter.initiativeOrder.length) {
    nextIdx = (nextIdx + 1) % encounter.initiativeOrder.length;
    attempts++;
  }

  // If we've gone through everyone, start new round
  if (nextIdx <= encounter.currentTurn || attempts > 0) {
    encounter.round++;
    // Process conditions at start of round
    processConditions(encounter);
  }

  encounter.currentTurn = nextIdx;
  const current = encounter.initiativeOrder[nextIdx];

  // Update state
  if (current.type === 'player') {
    encounter.state = 'player_turn';
  } else {
    encounter.state = 'enemy_turn';
  }

  return current;
}

function processConditions(encounter: CombatEncounter): void {
  for (const combatant of encounter.initiativeOrder) {
    if (!combatant.isAlive) continue;

    if (combatant.conditions.includes('poisoned')) {
      const dmg = rollDamage('1d4', 0);
      applyDamage(encounter, combatant.id, dmg.total);
    }
  }
}

export function isEncounterOver(encounter: CombatEncounter): 'victory' | 'defeat' | null {
  const playersAlive = encounter.initiativeOrder.filter(c => c.type === 'player' && c.isAlive).length;
  const enemiesAlive = encounter.initiativeOrder.filter(c => c.type === 'enemy' && c.isAlive).length;

  if (enemiesAlive === 0) return 'victory';
  if (playersAlive === 0) return 'defeat';
  return null;
}

export function getCurrentCombatant(encounter: CombatEncounter): Combatant | null {
  return encounter.initiativeOrder[encounter.currentTurn] || null;
}

export function getCombatant(encounter: CombatEncounter, id: string): Combatant | null {
  return encounter.initiativeOrder.find(c => c.id === id) || null;
}

export function getEnemies(encounter: CombatEncounter): Combatant[] {
  return encounter.initiativeOrder.filter(c => c.type === 'enemy' && c.isAlive);
}

export function getPlayers(encounter: CombatEncounter): Combatant[] {
  return encounter.initiativeOrder.filter(c => c.type === 'player' && c.isAlive);
}

// Enemy AI - simple tactical decisions
export function enemyAction(encounter: CombatEncounter, enemy: Combatant): CombatAction | null {
  const players = getPlayers(encounter);
  if (players.length === 0) return null;

  // Target lowest HP player
  const target = players.reduce((lowest, p) =>
    (p.hp / p.maxHp) < (lowest.hp / lowest.maxHp) ? p : lowest
  );

  // Low morale - 50% chance to flee if HP < 25%
  const isBoss = enemy.id.includes('warden') || enemy.name.toLowerCase().includes('warden');
  if (!isBoss && enemy.hp < enemy.maxHp * 0.25) {
    const fleeRoll = rollD20(0);
    if (fleeRoll.total >= 12) {
      return { actorId: enemy.id, type: 'flee', targetId: target.id };
    }
  }

  return {
    actorId: enemy.id,
    type: 'attack',
    targetId: target.id,
  };
}

export function attemptFlee(attacker: Combatant, encounter: CombatEncounter): boolean {
  const roll = rollD20(getAttributeModifier(attacker.type === 'player' ? 14 : 10));
  const enemies = getEnemies(encounter);
  const highestEnemyInit = enemies.reduce((max, e) => Math.max(max, e.initiative), 0);
  return roll.total > highestEnemyInit;
}
