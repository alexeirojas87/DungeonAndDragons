// ============================================================
// NPC DATA - The Sunken Crypt Adventure
// ============================================================

import type { NPC, DialogueNode } from '../engine/types';

export const ADVENTURE_NPCS: Record<string, NPC> = {
  innkeeper_martik: {
    id: 'innkeeper_martik',
    name: 'Martik',
    nameEs: 'Martik',
    portrait: 'innkeeper',
    faction: 'blackmere',
    location: 'black_lantern_tavern',
    disposition: 10,
    knowledge: ['blackmere_rumors', 'missing_villagers', 'crypt_entrance'],
    memory: [],
    dialogue: [
      {
        id: 'greeting',
        text: 'Martik sees the notice in your hand and sets the mug aside. "That final line is mine. Three people have vanished in a month, and the village council would rather call them runaways. If you came for the reward, first learn their names."',
        textEs: 'Martik ve el aviso en tu mano y deja la jarra a un lado. «La última línea la escribí yo. Tres personas han desaparecido en un mes y el consejo prefiere llamarlos fugitivos. Si vienes por la recompensa, primero aprende sus nombres».',
        responses: [
          {
            text: 'What\'s happening around here?',
            textEs: '¿Qué está pasando por aquí?',
            nextNodeId: 'rumors',
          },
          {
            text: 'I heard about missing villagers.',
            textEs: 'Escuché sobre aldeanos desaparecidos.',
            nextNodeId: 'missing_details',
          },
          {
            text: 'Just passing through.',
            textEs: 'Solo paso de largo.',
            nextNodeId: 'farewell',
          },
        ],
      },
      {
        id: 'rumors',
        text: 'People have been vanishing. Three in the last month. Old Mira\'s been whispering about that crypt in the hills. Says it was sealed for a reason.',
        textEs: 'La gente ha estado desapareciendo. Tres en el último mes. La vieja Mira ha estado susurrando sobre esa cripta en las colinas. Dice que fue sellada por una razón.',
        responses: [
          {
            text: 'Tell me more about the crypt.',
            textEs: 'Cuéntame más sobre la cripta.',
            nextNodeId: 'crypt_info',
          },
          {
            text: 'Who are the missing people?',
            textEs: '¿Quiénes son las personas desaparecidas?',
            nextNodeId: 'missing_details',
          },
        ],
      },
      {
        id: 'crypt_info',
        text: 'The Sunken Crypt. Been there since before Blackmere existed. Old kingdom stuff. They sealed it after the last expedition came back... wrong. One of them was Captain Varen. He doesn\'t talk about what he saw.',
        textEs: 'La Cripta Sumergida. Ha estado ahí desde antes de que existiera Blackmere. Cosas del viejo reino. La sellaron después de que la última expedición regresó... mal. Uno de ellos fue el Capitán Varen. No habla de lo que vio.',
        responses: [
          {
            text: 'Where can I find Captain Varen?',
            textEs: '¿Dónde puedo encontrar al Capitán Varen?',
            nextNodeId: 'varen_info',
          },
          {
            text: 'I should investigate the crypt.',
            textEs: 'Debería investigar la cripta.',
            nextNodeId: 'quest_offer',
          },
        ],
      },
      {
        id: 'missing_details',
        text: 'Young Tomas the farmer. Old Greta from the chapel. And... Elara\'s sister, Lyra. Elara hasn\'t been the same since. She spends her days at the chapel praying to anyone who\'ll listen.',
        textEs: 'El joven Tomas el granjero. La vieja Greta de la capilla. Y... la hermana de Elara, Lyra. Elara no ha sido la misma desde entonces. Pasa sus días en la capilla rezando a quien quiera escuchar.',
        responses: [
          {
            text: 'I want to help find them.',
            textEs: 'Quiero ayudar a encontrarlos.',
            nextNodeId: 'quest_offer',
          },
          {
            text: 'That\'s terrible. I\'ll look into it.',
            textEs: 'Es terrible. Lo investigaré.',
            nextNodeId: 'quest_offer',
          },
        ],
      },
      {
        id: 'varen_info',
        text: 'He\'s around. Comes in some nights, drinks alone. Quiet man. Hasn\'t been right since the expedition. If you ask me, that crypt took something from him.',
        textEs: 'Está por ahí. Viene algunas noches, bebe solo. Hombre tranquilo. No ha estado bien desde la expedición. Si me preguntas, esa cripta le quitó algo.',
        responses: [
          {
            text: 'I\'ll find him.',
            textEs: 'Lo encontraré.',
            nextNodeId: 'farewell',
          },
        ],
      },
      {
        id: 'quest_offer',
        text: 'If you\'re fool enough to go poking around in that crypt, I won\'t stop you. But bring back our people if you can. Mira will want to know you\'re heading there. She might have something useful for you.',
        textEs: 'Si eres lo suficientemente tonto para ir a investigar esa cripta, no te lo impediré. Pero trae de vuelta a nuestra gente si puedes. Mira querrá saber que vas hacia allá. Podría tener algo útil para ti.',
        responses: [
          {
            text: 'I\'ll talk to Mira.',
            textEs: 'Hablaré con Mira.',
            nextNodeId: 'farewell',
            effects: [{ type: 'QUEST_UPDATED', timestamp: 0, data: { questId: 'the_sunken_crypt' } }],
          },
        ],
      },
      {
        id: 'farewell',
        text: 'Watch yourself out there. The woods have been... restless lately.',
        textEs: 'Cuídate ahí fuera. Los bosques han estado... inquietos últimamente.',
        responses: [],
      },
    ],
    inventory: [],
    alive: true,
    occupation: 'Innkeeper',
    occupationEs: 'Posadero',
    secrets: ['Varen comes in at night and drinks alone, muttering about "the eyes"'],
    secretsEs: ['Varen viene de noche y bebe solo, murmurando sobre "los ojos"'],
    personality: 'Gruff but caring. Lost his own brother to the crypt years ago.',
    personalityEs: 'Gruñón pero cuidadoso. Perdió a su propio hermano en la cripta hace años.',
  },
  mysterious_stranger: {
    id: 'mysterious_stranger',
    name: 'The Stranger',
    nameEs: 'El Desconocido',
    portrait: 'stranger',
    faction: 'unknown',
    location: 'black_lantern_tavern',
    disposition: 0,
    knowledge: ['ancient_lore', 'crypt_secrets'],
    memory: [],
    dialogue: [
      {
        id: 'greeting',
        text: 'The hooded figure notices the folded notice among your belongings. "So the promise of a hundred gold brought another adventurer to Blackmere. Sit—if you truly intend to enter the crypt, there is something Martik cannot tell you."',
        textEs: 'La figura encapuchada distingue el aviso doblado entre tus pertenencias. «Así que la promesa de cien piezas de oro ha traído a otro aventurero a Blackmere. Siéntate; si de verdad piensas entrar en la cripta, hay algo que Martik no puede contarte».',
        responses: [
          {
            text: 'Do I know you?',
            textEs: '¿Te conozco?',
            nextNodeId: 'identity',
          },
          {
            text: 'What do you know about the crypt?',
            textEs: '¿Qué sabes sobre la cripta?',
            nextNodeId: 'crypt_knowledge',
          },
        ],
      },
      {
        id: 'identity',
        text: '"No. I know the notice you carry—and who wrote the final line." They lean forward. "The thing beneath the crypt is not guarding treasure. It is guarding a door."',
        textEs: '«No. Conozco el aviso que llevas y sé quién escribió la última línea». La figura se inclina hacia delante. «Lo que habita bajo la cripta no protege un tesoro. Protege una puerta».',
        responses: [
          {
            text: 'What door?',
            textEs: '¿Qué puerta?',
            nextNodeId: 'the_door',
          },
          {
            text: 'How do you know this?',
            textEs: '¿Cómo sabes esto?',
            nextNodeId: 'how_i_know',
          },
        ],
      },
      {
        id: 'crypt_knowledge',
        text: '"The Sunken Crypt was built by the Ashen Court, an ancient civilization that worshipped the boundary between life and death. The Warden is their last sentinel. Kill it, and the door opens." They pause. "Or it breaks."',
        textEs: '"La Cripta Sumergida fue construida por la Corte Ceniza, una civilización antigua que adoraba el límite entre la vida y la muerte. El Guardián es su último centinela. Mátalo, y la puerta se abre." Pausa. "O se rompe."',
        responses: [
          {
            text: 'What\'s behind the door?',
            textEs: '¿Qué hay detrás de la puerta?',
            nextNodeId: 'the_door',
          },
          {
            text: 'Why are you telling me this?',
            textEs: '¿Por qué me estás contando esto?',
            nextNodeId: 'why_tell',
          },
        ],
      },
      {
        id: 'the_door',
        text: '"Something that was sealed away. Something that was never meant to be found." They hand you a small vial of shimmering liquid. "Pour this on the Warden\'s remains. It\'s the only way to close the door again."',
        textEs: '"Algo que fue sellado. Algo que nunca se supo que debía ser encontrado." Te entregan un pequeño frasco de líquido brillante. "Vierte esto sobre los restos del Guardián. Es la única manera de cerrar la puerta de nuevo."',
        responses: [
          {
            text: 'Thank you.',
            textEs: 'Gracias.',
            nextNodeId: 'farewell',
            effects: [{ type: 'ITEM_ACQUIRED', timestamp: 0, data: { itemId: 'sealing_vial' } }],
          },
        ],
      },
      {
        id: 'how_i_know',
        text: '"I was on the last expedition. I\'m the reason we survived." They pull back their hood, revealing a scarred face. "And I\'m the reason we should go back."',
        textEs: '"Estuve en la última expedición. Yo soy la razón por la que sobrevivimos." Se quitan la capucha, revelando un rostro marcado. "Y yo soy la razón por la que deberíamos volver."',
        responses: [
          {
            text: 'Then come with me.',
            textEs: 'Entonces ven conmigo.',
            nextNodeId: 'farewell',
          },
        ],
      },
      {
        id: 'why_tell',
        text: '"Because I can\'t go back alone. And because those people are still alive. For now." They finish their drink. "The Warden keeps them in chains below. Feeding on their fear."',
        textEs: '"Porque no puedo volver solo. Y porque esa gente sigue viva. Por ahora." Terminan su bebida. "El Guardián los mantiene en cadenas abajo. Alimentándose de su miedo."',
        responses: [
          {
            text: 'I\'ll save them.',
            textEs: 'Los salvaré.',
            nextNodeId: 'farewell',
            effects: [{ type: 'QUEST_UPDATED', timestamp: 0, data: { questId: 'the_sunken_crypt', objective: 'stranger_hint' } }],
          },
        ],
      },
      {
        id: 'farewell',
        text: '"Be careful. The Warden is ancient, and it does not fight fair." They vanish into the shadows of the tavern.',
        textEs: '"Ten cuidado. El Guardián es antiguo, y no lucha limpio." Desaparecen en las sombras de la taberna.',
        responses: [],
      },
    ],
    inventory: [],
    alive: true,
    occupation: 'Unknown',
    occupationEs: 'Desconocido',
    secrets: ['Is Captain Varen, scarred from the expedition'],
    secretsEs: ['Es el Capitán Varen, marcado por la expedición'],
    personality: 'Mysterious, knowledgeable, burdened by guilt.',
    personalityEs: 'Misterioso, conocedor, cargado de culpa.',
  },
  elder_mira: {
    id: 'elder_mira',
    name: 'Elder Mira',
    nameEs: 'Anciana Mira',
    portrait: 'elder',
    faction: 'blackmere',
    location: 'blackmere_village',
    disposition: 5,
    knowledge: ['crypt_history', 'ancient_runes', 'missing_villagers'],
    memory: [],
    dialogue: [
      {
        id: 'greeting',
        text: 'An elderly woman with sharp eyes watches you from her doorway. "You have the look of someone heading toward trouble. The crypt, I suppose."',
        textEs: 'Una mujer anciana con ojos agudos te observa desde su puerta. "Tienes el aspecto de alguien que se dirige hacia problemas. La cripta, supongo."',
        responses: [
          {
            text: 'I need information about the crypt.',
            textEs: 'Necesito información sobre la cripta.',
            nextNodeId: 'crypt_info',
          },
          {
            text: 'The missing villagers—what happened?',
            textEs: 'Los aldeanos desaparecidos—¿qué pasó?',
            nextNodeId: 'villagers',
          },
        ],
      },
      {
        id: 'crypt_info',
        text: '"The Sunken Crypt was sealed three hundred years ago. The Ashen Court built it as a tomb, but also as a prison. Inside is the Crypt Warden—a construct of bone and dark magic. It was meant to guard something that should never see daylight."',
        textEs: '"La Cripta Sumergida fue sellada hace trescientos años. La Corte Ceniza la construyó como tumba, pero también como prisión. Dentro está el Guardián de la Cripta—una construcción de hueso y magia oscura. Fue diseñado para guardar algo que nunca debería ver la luz del día."',
        responses: [
          {
            text: 'How do I defeat the Warden?',
            textEs: '¿Cómo derroto al Guardián?',
            nextNodeId: 'warden_weakness',
          },
          {
            text: 'Can you help me read the runes?',
            textEs: '¿Puedes ayudarme a leer las runas?',
            nextNodeId: 'runes_help',
          },
        ],
      },
      {
        id: 'warden_weakness',
        text: '"The Warden is bound to the bones of the crypt. Destroy the bone amulets in the treasury and its power weakens. But beware—it knows the crypt better than you ever will. It will try to separate you."',
        textEs: '"El Guardián está atado a los huesos de la cripta. Destruye los amuletos de hueso en el tesoro y su poder se debilita. Pero ten cuidado—conoce la cripta mejor de lo que tú jamás lo hará. Intentará separarte."',
        responses: [
          {
            text: 'I\'ll remember that.',
            textEs: 'Lo recordaré.',
            nextNodeId: 'farewell',
          },
        ],
      },
      {
        id: 'runes_help',
        text: '"The runes on the entrance speak of the Ashen Court\'s final decree: \'Let no living soul pass the threshold, lest the Warden wake.\'" She pauses. "If you can read the runes on the statues in the puzzle chamber, they\'ll guide you to the treasury."',
        textEs: '"Las runas en la entrada hablan del último decreto de la Corte Ceniza: \'Que ningún alma viva cruce el umbral, si no el Guardián despertará.\'" Pausa. "Si puedes leer las runas en las estatuas de la cámara de acertijos, te guiarán al tesoro."',
        responses: [
          {
            text: 'Thank you, Elder.',
            textEs: 'Gracias, Anciana.',
            nextNodeId: 'farewell',
          },
        ],
      },
      {
        id: 'villagers',
        text: '"Tomas went looking for his lost goat near the crypt. Never came back. Greta went to pray at the old shrine inside. And Lyra..." She sighs. "Lyra heard voices calling from the crypt. She said they sounded like her mother."',
        textEs: '"Tomas fue a buscar su cabra perdida cerca de la cripta. Nunca regresó. Greta fue a rezar en el viejo santuario dentro. Y Lyra..." Suspira. "Lyra escuchó voces llamando desde la cripta. Dijo que sonaban como su madre."',
        responses: [
          {
            text: 'I\'ll find them.',
            textEs: 'Los encontraré.',
            nextNodeId: 'farewell',
            effects: [{ type: 'QUEST_UPDATED', timestamp: 0, data: { questId: 'the_sunken_crypt' } }],
          },
        ],
      },
      {
        id: 'farewell',
        text: '"Go with care. And if you find my old amulet in there—bring it back. It was my grandmother\'s."',
        textEs: '"Ve con cuidado. Y si encuentras mi viejo amuleto ahí—tráemelo. Era de mi abuela."',
        responses: [],
      },
    ],
    inventory: [],
    alive: true,
    occupation: 'Village Elder',
    occupationEs: 'Anciana del Pueblo',
    secrets: ['The crypt contains a door to something sealed by the Ashen Court'],
    secretsEs: ['La cripta contiene una puerta a algo sellado por la Corte Ceniza'],
    personality: 'Wise and direct. Has studied the crypt\'s history for decades.',
    personalityEs: 'Sabia y directa. Ha estudiado la historia de la cripta durante décadas.',
  },
  blacksmith_aldric: {
    id: 'blacksmith_aldric',
    name: 'Aldric',
    nameEs: 'Aldric',
    portrait: 'blacksmith',
    faction: 'blackmere',
    location: 'blackmere_village',
    disposition: 0,
    knowledge: ['weapon_maintenance', 'local_crafts'],
    memory: [],
    dialogue: [
      {
        id: 'greeting',
        text: 'A burly man hammers at a piece of glowing metal. He doesn\'t look up. "If you need something fixed, leave it by the door. If you need something made, tell me what and I\'ll tell you when."',
        textEs: 'Un hombre macizo martilla un trozo de metal brillante. No mira hacia arriba. "Si necesitas algo arreglado, déjalo junto a la puerta. Si necesitas algo hecho, dime qué y te diré cuándo."',
        responses: [
          {
            text: 'Can you upgrade my equipment?',
            textEs: '¿Puedes mejorar mi equipo?',
            nextNodeId: 'upgrade',
          },
          {
            text: 'Do you know anything about the crypt?',
            textEs: '¿Sabes algo sobre la cripta?',
            nextNodeId: 'crypt_info',
          },
        ],
      },
      {
        id: 'upgrade',
        text: '"I can sharpen blades, patch armor, that sort of thing. Bring me the materials and I\'ll do what I can. Won\'t be cheap."',
        textEs: '"Puedo afilar hojas, parchar armaduras, ese tipo de cosas. Tráeme los materiales y haré lo que pueda. No será barato."',
        responses: [
          {
            text: 'I\'ll keep that in mind.',
            textEs: 'Lo tendré en cuenta.',
            nextNodeId: 'farewell',
          },
        ],
      },
      {
        id: 'crypt_info',
        text: '"My grandfather forged the chains they used to seal that place. Said the metal had to be blessed by three different temples. If the seal\'s broken, those chains are just scrap."',
        textEs: '"Mi abuelo forjó las cadenas que usaron para sellar ese lugar. Dijo que el metal tuvo que ser bendecido por tres templos diferentes. Si el sello está roto, esas cadenas son solo chatarra."',
        responses: [
          {
            text: 'Interesting.',
            textEs: 'Interesante.',
            nextNodeId: 'farewell',
          },
        ],
      },
      {
        id: 'farewell',
        text: '"Watch yourself. Those bones in there don\'t tire."',
        textEs: '"Cuídate. Esos huesos ahí dentro no se cansan."',
        responses: [],
      },
    ],
    inventory: [],
    alive: true,
    occupation: 'Blacksmith',
    occupationEs: 'Herrero',
    secrets: ['Has rare metalworking materials that could help against the Warden'],
    secretsEs: ['Tiene materiales de metalistería raros que podrían ayudar contra el Guardián'],
    personality: 'Practical, no-nonsense. Speaks in short sentences.',
    personalityEs: 'Práctico, sin rodeos. Habla en oraciones cortas.',
  },
  priest_sera: {
    id: 'priest_sera',
    name: 'Priest Sera',
    nameEs: 'Sacerdotisa Sera',
    portrait: 'priest',
    faction: 'ashen_veil',
    location: 'village_chapel',
    disposition: 5,
    knowledge: ['divine_magic', 'crypt_seals', 'ashen_veil_history'],
    memory: [],
    dialogue: [
      {
        id: 'greeting',
        text: 'A woman in grey robes tends candles before the altar. She turns with a gentle smile. "Welcome to the Chapel of the Ashen Veil. Are you seeking guidance?"',
        textEs: 'Una mujer en túnicas grises cuida velas antes del altar. Sonríe suavemente. "Bienvenido a la Capilla del Velo Ceniza. ¿Buscas guía?"',
        responses: [
          {
            text: 'I\'m investigating the missing villagers.',
            textEs: 'Estoy investigando a los aldeanos desaparecidos.',
            nextNodeId: 'villagers',
          },
          {
            text: 'What is the Ashen Veil?',
            textEs: '¿Qué es el Velo Ceniza?',
            nextNodeId: 'ashen_veil',
          },
        ],
      },
      {
        id: 'villagers',
        text: '"I prayed for them every day. Lyra was a faithful visitor. She would light candles and speak to the old spirits." Sera\'s expression darkens. "The last time she came, she said the spirits were calling her name."',
        textEs: '"Oré por ellos cada día. Lyra era una visitante fiel. Encendía velas y hablaba con los viejos espíritus." La expresión de Sera se oscurece. "La última vez que vino, dijo que los espíritus estaban llamando su nombre."',
        responses: [
          {
            text: 'That sounds like the Warden\'s work.',
            textEs: 'Eso suena como obra del Guardián.',
            nextNodeId: 'warden_info',
          },
          {
            text: 'Can you bless my equipment?',
            textEs: '¿Puedes bendecir mi equipo?',
            nextNodeId: 'blessing',
          },
        ],
      },
      {
        id: 'ashen_veil',
        text: '"We are the last of an old order. The Ashen Court built the crypt, and we were meant to watch over it. But our numbers have... dwindled." She looks at the cracked altar. "We failed."',
        textEs: '"Somos los últimos de una orden antigua. La Corte Ceniza construyó la cripta, y nosotros debíamos vigilarla. Pero nuestros números se han... reducido." Mira el altar agrietado. "Fallamos."',
        responses: [
          {
            text: 'You can help me set things right.',
            textEs: 'Puedes ayudarme a enmendar las cosas.',
            nextNodeId: 'farewell',
          },
        ],
      },
      {
        id: 'warden_info',
        text: '"The Warden feeds on fear. The more afraid you are, the stronger it becomes. The ancient texts say: \'Courage is the only armor that pierces the Warden\'s bone.\'"',
        textEs: '"El Guardián se alimenta de miedo. Cuanto más tengas miedo, más fuerte se vuelve. Los textos antiguos dicen: \'El coraje es la única armadura que perfora los huesos del Guardián.\'"',
        responses: [
          {
            text: 'I\'ll remember that.',
            textEs: 'Lo recordaré.',
            nextNodeId: 'farewell',
          },
        ],
      },
      {
        id: 'blessing',
        text: '"I can offer a blessing of the Ashen Veil. It won\'t make you invulnerable, but it may shield your spirit from the Warden\'s dread." She places her hands on your weapon. A faint warmth spreads through the metal.',
        textEs: '"Puedo ofrecer una bendición del Velo Ceniza. No te hará invulnerable, pero puede proteger tu espíritu del terror del Guardián." Coloca sus manos sobre tu arma. Un calor tenue se extiende por el metal.',
        responses: [
          {
            text: 'Thank you, Priest.',
            textEs: 'Gracias, Sacerdotisa.',
            nextNodeId: 'farewell',
            effects: [{ type: 'SPELL_CAST', timestamp: 0, data: { spell: 'blessing', target: 'player' } }],
          },
        ],
      },
      {
        id: 'farewell',
        text: '"May the Veil protect you. And if you find any of our sacred texts in the crypt... please return them."',
        textEs: '"Que el Velo te proteja. Y si encuentras algún texto sagrado en la cripta... por favor devuélvelo."',
        responses: [],
      },
    ],
    inventory: [],
    alive: true,
    occupation: 'Priest',
    occupationEs: 'Sacerdotisa',
    secrets: ['The Ashen Veil was once a powerful order; Sera is the last active member'],
    secretsEs: ['El Velo Ceniza fue una vez una orden poderosa; Sera es la última miembro activa'],
    personality: 'Gentle but resolute. Carries the weight of her order\'s failure.',
    personalityEs: 'Gentil pero resoluta. Lleva el peso del fracaso de su orden.',
  },
  captured_villager: {
    id: 'captured_villager',
    name: 'Lyra',
    nameEs: 'Lyra',
    portrait: 'villager',
    faction: 'blackmere',
    location: 'crypt_guardian_room',
    disposition: 20,
    knowledge: ['warden_prison', 'crypt_interior'],
    memory: [],
    dialogue: [
      {
        id: 'greeting',
        text: 'A young woman chained to the wall. She looks up with desperate eyes. "You\'re alive? Please—you have to destroy that thing. It keeps us here. Feeds on our fear."',
        textEs: 'Una joven encadenada a la pared. Mira hacia arriba con ojos desesperados. "¿Estás vivo? Por favor—tienes que destruir esa cosa. Nos mantiene aquí. Se alimenta de nuestro miedo."',
        responses: [
          {
            text: 'I\'m going to destroy the Warden.',
            textEs: 'Voy a destruir al Guardián.',
            nextNodeId: 'encourage',
          },
          {
            text: 'Where are the others?',
            textEs: '¿Dónde están los demás?',
            nextNodeId: 'others',
          },
        ],
      },
      {
        id: 'encourage',
        text: '"The Warden has a heart of bone beneath its ribs. Strike it, and it weakens. But be careful—it will try to make you see things. Things that make you afraid."',
        textEs: '"El Guardián tiene un corazón de hueso debajo de sus costillas. Golpéalo, y se debilita. Pero ten cuidado—intentará hacerte ver cosas. Cosas que te dan miedo."',
        responses: [
          {
            text: 'I won\'t be afraid.',
            textEs: 'No tendré miedo.',
            nextNodeId: 'farewell',
          },
        ],
      },
      {
        id: 'others',
        text: '"Tomas is in the cell to the left. Old Greta is... she hasn\'t spoken in days. The Warden took something from her. Her voice, I think."',
        textEs: '"Tomas está en la celda a la izquierda. La vieja Greta está... no ha hablado en días. El Guardián le quitó algo. Su voz, creo."',
        responses: [
          {
            text: 'I\'ll free all of you.',
            textEs: 'Los liberaré a todos.',
            nextNodeId: 'farewell',
          },
        ],
      },
      {
        id: 'farewell',
        text: '"Please hurry. I don\'t know how much longer we can hold on."',
        textEs: '"Por favor date prisa. No sé cuánto más podemos aguantar."',
        responses: [],
      },
    ],
    inventory: [],
    alive: true,
    occupation: 'Farmer',
    occupationEs: 'Granjera',
    secrets: ['The Warden has a bone heart that is its weakness'],
    secretsEs: ['El Guardián tiene un corazón de hueso que es su debilidad'],
    personality: 'Frightened but brave. Cares deeply about the other captives.',
    personalityEs: 'Asustada pero valiente. Le importan profundamente los demás cautivos.',
  },
};
