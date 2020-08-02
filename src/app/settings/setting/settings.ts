export const Settings = {
  startNew: { admin: true, type: 'button', label: 'New Round', trigger: 'c/start', data: 'new' },
  nextBoat: {
    id: 1, group: 'lobby', type: 'boat', trigger: 'nextBoat',
    titles: ['Rocket', 'Armored', 'Bomb', 'Bread', 'Maiden', , , , , , 'Small Duck', 'Medium Duck', 'Large Duck', 'Defenduck'],
    groups: [
      { name: 'Standard', options: [0, 1, 2, 3, 4] },
      { name: 'Ducks', options: [10, 11, 12, 13] }
    ]
  },
  nextCadeBoat: {
    id: 19, group: 'cade', name: 'nextBoat', type: 'boat', trigger: 'nextBoat',
    titles: [, , , , , , , , , , , , , , 'War Brig', 'War Frig'],
    groups: [
      { name: 'Ships', options: [14, 15] },
    ]
  },
  mapScale: {
    id: 2, group: 'lobby', type: 'slider', label: 'Map Scale', min: 15, max: 100, step: 1
  },
  speed: {
    id: 3, group: 'lobby', type: 'slider', label: 'Animate Speed', min: 10, max: 50, step: 5
  },
  cadeMapScale: {
    id: 22, group: 'cade', name: 'mapScale', type: 'slider', label: 'Map Scale', min: 15, max: 100, step: 1
  },
  cadeSpeed: {
    id: 23, group: 'cade', name: 'speed', type: 'slider', label: 'Animate Speed', min: 10, max: 50, step: 5
  },
  spawnSide: {
    admin: true, id: 21, group: 'cade', type: 'option', label: 'Spawn Side', trigger: 'spawnSide', options: [
      'Island', 'Ocean'
    ]
  },
  team: {
    admin: true, id: 20, group: 'cade', type: 'option', label: 'Team', trigger: 'team', options: [
      'Defenders', 'Attackers'
    ]
  },
  cadePublicMode: {
    admin: true, id: 25, group: 'l/cade', name: 'publicMode', type: 'option', label: 'Lobby Privacy', options: [
      'Public', 'Public Application', 'Invite Only'
    ]
  },
  cadeMaxPlayers: {
    admin: true, id: 26, group: 'l/cade', name: 'maxPlayers', type: 'slider', label: 'Max Players', min: 0, max: 40
  },
  cadeHotEntry: {
    admin: true, id: 27, group: 'l/cade', name: 'hotEntry', type: 'checkbox', label: 'Allow join while an<br>entry is in progress'
  },
  cadeMap: {
    admin: true, id: 18, group: 'l/cade', name: 'map', type: 'customMap', label: 'Custom Map', cmd: 'g/cgmaps'
  },
  duckLvl: {
    admin: true, id: 4, group: 'l/quacken', type: 'slider', label: 'Duck Level', min: 0, max: 11, step: 1
  },
  maxPlayers: {
    admin: true, id: 5, group: 'l/quacken', type: 'slider', label: 'Max Players', min: 0, max: 13
  },
  publicMode: {
    admin: true, id: 6, group: 'l/quacken', type: 'option', label: 'Lobby Privacy', options: [
      'Public', 'Public Application', 'Invite Only'
    ]
  },
  tileSet: {
    admin: true, id: 7, group: 'l/quacken', type: 'tileSet', label: 'Tile Set', cmd: 'g/tilesets'
  },
  structureSet: {
    admin: true, id: 8, group: 'l/quacken', type: 'structureSet', label: 'Structure Set', cmd: 'g/structuresets'
  },
  hotEntry: {
    admin: true, id: 9, group: 'l/quacken', type: 'checkbox', label: 'Allow join while an<br>entry is in progress'
  },
  autoGen: {
    admin: true, id: 10, group: 'l/quacken', type: 'checkbox', label: 'Generate new map<br>when a round starts'
  },
  kbControls: {
    id: 11, group: 'lobby', type: 'checkbox', label: 'Enable keyboard<br>move entry'
  },
  customMap: {
    admin: true, id: 12, group: 'l/quacken', type: 'customMap', label: 'Custom Map', cmd: 'g/maps'
  },
  hideMoves: {
    admin: true, id: 13, group: 'l/quacken', type: 'checkbox', label: 'Hide Moves'
  },
  createType: {
    id: 14, group: 'l/create', type: 'option', options: [
      'Quacken', 'HexaQuack', 'Spades'
    ]
  },
  turnTime: {
    admin: true, id: 15, group: 'l/spades', type: 'slider', label: 'Turn Time', min: 5, max: 30
  },
  playTo: {
    admin: true, id: 16, group: 'l/spades', type: 'slider', label: 'Play To', min: 250, max: 1000, step: 50
  },
  watchers: {
    admin: true, id: 17, group: 'l/spades', type: 'checkbox', label: 'Allow Watchers'
  },
};
