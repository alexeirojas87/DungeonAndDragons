import assert from 'node:assert/strict';
import { createCharacter } from '../src/engine/character';
import { createEncounter } from '../src/engine/combat';
import { DIFFICULTY_RULES } from '../src/engine/difficulty';
import { GameEngine } from '../src/engine/gameEngine';
import { MONSTER_TEMPLATES } from '../src/data/monsters';
import { loadGame, saveGame } from '../src/lib/persistence';
import type { Archetype, Difficulty, Origin } from '../src/engine/types';

const archetypes: Archetype[] = ['warrior', 'rogue', 'ranger', 'mage', 'cleric'];
const origins: Origin[] = ['ashenvale', 'ironcoast', 'shadowfen', 'stormreach', 'deephollow'];
const difficulties: Difficulty[] = ['story', 'oath', 'trial'];

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

Object.defineProperty(globalThis, 'localStorage', { value: new MemoryStorage(), configurable: true });

function validateDifficultyMatrix(): void {
  const attackBonuses = new Set<number>();
  for (const archetype of archetypes) {
    for (const origin of origins) {
      const routesByDifficulty: string[][] = [];
      for (const difficulty of difficulties) {
        const hero = createCharacter(`${archetype}-${origin}`, archetype, origin);
        const engine = new GameEngine();
        engine.initGame(hero, difficulty);
        const enemy = { ...MONSTER_TEMPLATES.ambush_wolf, id: `wolf-${difficulty}` };
        const encounter = createEncounter([hero], [enemy], [], difficulty);
        const player = encounter.initiativeOrder.find(combatant => combatant.type === 'player');
        const foe = encounter.initiativeOrder.find(combatant => combatant.type === 'enemy');
        assert(player && foe);
        assert.equal(player.damage, hero.equipment.weapon_main?.properties.damage ?? '1d4');
        assert.equal(player.ac, hero.ac);
        assert.equal(foe.maxHp, difficulty === 'story' ? 8 : difficulty === 'trial' ? 12 : 10);
        assert.equal(foe.attackBonus, 2 + DIFFICULTY_RULES[difficulty].enemyAttackModifier);
        attackBonuses.add(player.attackBonus);
        routesByDifficulty.push(engine.getAvailableStoryChoices().map(choice => choice.id));
      }
      assert.deepEqual(routesByDifficulty[0], routesByDifficulty[1]);
      assert.deepEqual(routesByDifficulty[1], routesByDifficulty[2]);
    }
  }
  assert(attackBonuses.size > 1, 'player archetype/origin statistics must produce different attack bonuses');
  console.log('✓ 25 archetype×origin combinations across three difficulties');
}

function validateStaticSaveAndLegacyMigration(): void {
  localStorage.clear();
  const engine = new GameEngine();
  engine.initGame(createCharacter('Iria', 'ranger', 'stormreach'), 'trial');
  saveGame(engine.getState(), engine.getNarrative(), 'es');
  const serialized = JSON.parse(localStorage.getItem('gauntlet_save') ?? '{}');
  assert.deepEqual(serialized.gameState.chapters, []);
  const restored = loadGame();
  assert(restored);
  assert.equal(restored.gameState.chapters[0].id, 'chapter-01');
  assert.equal(restored.gameState.difficulty, 'trial');

  const legacyState = structuredClone(engine.getState());
  legacyState.flags.rescued_villagers = true;
  legacyState.flags.varen_guide = true;
  legacyState.chapters.push({ ...legacyState.chapters[0], id: 'generated-02', index: 2 });
  legacyState.activeChapterIndex = 1;
  delete (legacyState as Partial<typeof legacyState>).campaignProgress;
  delete (legacyState as Partial<typeof legacyState>).difficulty;
  localStorage.setItem('gauntlet_save', JSON.stringify({
    version: 3,
    gameState: legacyState,
    narrative: engine.getNarrative(),
    language: 'es',
    savedAt: Date.now(),
  }));
  const migrated = loadGame();
  assert(migrated);
  assert.equal(migrated.gameState.party[0].name, 'Iria');
  assert.equal(migrated.gameState.party[0].inventory.length, engine.getState().party[0].inventory.length);
  assert.equal(migrated.gameState.activeChapterIndex, 0);
  assert.equal(migrated.gameState.story.currentNodeId, 'ending_rescue');
  assert.equal(migrated.gameState.status, 'chapter_complete');
  assert.equal(migrated.gameState.campaignProgress.legacyFlags.varen_guide, true);
  console.log('✓ static saves rehydrate and generated saves migrate to Chapter 1 ending');
}

validateDifficultyMatrix();
validateStaticSaveAndLegacyMigration();
