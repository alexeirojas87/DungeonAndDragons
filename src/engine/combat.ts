// ============================================================
// COMBAT ENGINE - Turn-based combat system
// The AI must never override combat results.
// ============================================================

import type {
  Character, Enemy, CombatEncounter, Combatant, CombatAction,
  CombatLogEntry, CombatState, Condition, DamageType, DiceRoll, Difficulty
} from './types';
import { rollD20, rollDamage, getAttributeModifier, rollDice } from './dice';
import { eventBus, createEvent } from './events';
import { ARCHETYPES } from './character';
import { difficultyRules, scalePositive } from './difficulty';

let encounterCounter = 0;

export function createEncounter(
  party: Character[],
  enemies: Enemy[],
  environment: string[] = [],
  difficulty: Difficulty = 'oath',
): CombatEncounter {
  const combatants: Combatant[] = [];
  const rules = difficultyRules(difficulty);

  // Add party members
  for (const char of party) {
    const initRoll = rollD20(getAttributeModifier(char.attributes.dexterity));
    const weapon = char.equipment.weapon_main;
    const usesDexterity = Boolean(weapon?.properties.range)
      || weapon?.templateId.includes('dagger')
      || (char.archetype === 'rogue' && weapon?.type === 'weapon');
    const weaponAttribute = usesDexterity ? char.attributes.dexterity : char.attributes.strength;
    const weaponSkill = usesDexterity ? 'ranged' : 'melee';
    const proficiency = ARCHETYPES[char.archetype].proficientSkills.includes(weaponSkill) ? 2 + Math.floor((char.level - 1) / 4) : 0;
    const spellAttribute = char.archetype === 'cleric' ? char.attributes.wisdom : char.attributes.intelligence;
    const spellProficiency = char.spells.length > 0 ? 2 + Math.floor((char.level - 1) / 4) : 0;
    combatants.push({
      id: char.id,
      name: char.name,
      nameEs: char.name,
      type: 'player',
      initiative: initRoll.total,
      hp: char.hp,
      maxHp: char.maxHp,
      ac: char.ac,
      attackBonus: getAttributeModifier(weaponAttribute) + (char.skills[weaponSkill] ?? 0) + proficiency,
      spellAttackBonus: getAttributeModifier(spellAttribute) + spellProficiency,
      spellDamageBonus: getAttributeModifier(spellAttribute),
      damage: weapon?.properties.damage ?? '1d4',
      damageBonus: getAttributeModifier(weaponAttribute),
      damageMultiplier: 1,
      damageType: weapon?.properties.damageType ?? 'bludgeoning',
      abilities: [],
      abilitiesEs: [],
      conditions: [...char.conditions],
      portrait: char.portrait,
      isAlive: true,
    });
  }

  // Add enemies
  for (const enemy of enemies) {
    const maxHp = scalePositive(enemy.maxHp, rules.enemyHpMultiplier);
    const hpRatio = enemy.maxHp > 0 ? enemy.hp / enemy.maxHp : 1;
    const hp = Math.max(1, Math.min(maxHp, Math.round(maxHp * hpRatio)));
    const initRoll = rollD20(getAttributeModifier(enemy.intelligence));
    combatants.push({
      id: enemy.id,
      name: enemy.name,
      nameEs: enemy.nameEs,
      type: 'enemy',
      initiative: initRoll.total,
      hp,
      maxHp,
      ac: enemy.ac,
      attackBonus: getAttributeModifier(enemy.attack) + rules.enemyAttackModifier,
      spellAttackBonus: getAttributeModifier(enemy.attack) + rules.enemyAttackModifier,
      spellDamageBonus: 0,
      damage: enemy.damage,
      damageBonus: 0,
      damageMultiplier: rules.enemyDamageMultiplier,
      damageType: enemy.damageType,
      abilities: [...enemy.abilities],
      abilitiesEs: [...enemy.abilitiesEs],
      conditions: [...enemy.conditions],
      portrait: enemy.portrait,
      isAlive: true,
    });
  }

  // Sort by initiative (highest first)
  combatants.sort((a, b) => b.initiative - a.initiative);

  const encounter: CombatEncounter = {
    id: `encounter_${Date.now()}_${++encounterCounter}`,
    enemies: enemies.map(enemy => {
      const maxHp = scalePositive(enemy.maxHp, rules.enemyHpMultiplier);
      return { ...enemy, maxHp, hp: Math.max(1, Math.min(maxHp, Math.round(maxHp * (enemy.hp / enemy.maxHp)))) };
    }),
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
  const conditionModifier = attacker.conditions.includes('frightened') ? -2
    : attacker.conditions.includes('blessed') ? 2
      : 0;
  const packModifier = attacker.abilities.includes('Pack Tactics')
    && encounter.initiativeOrder.some(combatant => combatant.type === 'enemy' && combatant.id !== attacker.id && combatant.isAlive)
    ? 2
    : 0;
  const echoModifier = attacker.abilities.includes('Ethereal Echo') && encounter.round % 2 === 0 ? 1 : 0;
  const attackRoll = rollD20(
    (isSpell ? attacker.spellAttackBonus : attacker.attackBonus)
      + conditionModifier + packModifier + echoModifier,
  );
  const reactiveAc = defender.ac
    + (defender.abilities.includes('Parry') ? 1 : 0)
    + (defender.abilities.includes('Bone Shield') && defender.hp > defender.maxHp / 2 ? 1 : 0);
  const hit = attackRoll.total >= reactiveAc || attackRoll.isCritical;
  const critical = attackRoll.isCritical;

  let damage = 0;
  if (hit) {
    const damageStr = isSpell && spellDamage
      ? spellDamage
      : attacker.damage;
    const baseBonus = isSpell ? attacker.spellDamageBonus : attacker.damageBonus;
    const dmgRoll = rollDamage(damageStr, baseBonus);
    const abilityDamage = attacker.abilities.includes('Bone Storm') && encounter.round % 3 === 0
      ? rollDamage('1d4').total
      : 0;
    const rolledDamage = (critical ? dmgRoll.total * 2 : dmgRoll.total) + abilityDamage;
    damage = scalePositive(rolledDamage, attacker.damageMultiplier);
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
